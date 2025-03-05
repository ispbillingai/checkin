
<?php
// Start session
session_start();

// Check if it's a POST request
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Include database configuration
require_once 'db_config.php';

// Get form data
$room = $_POST['room'] ?? '';
$arrivalDateTime = $_POST['arrivalDateTime'] ?? '';
$departureDateTime = $_POST['departureDateTime'] ?? '';
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$phone = $_POST['phone'] ?? '';

// Validate input
if (empty($room) || empty($arrivalDateTime) || empty($departureDateTime) || empty($name) || empty($email) || empty($phone)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

try {
    // Connect to database
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if room has a fixed passcode
    $stmt = $conn->prepare("SELECT fixed_passcode FROM rooms WHERE id = :room");
    $stmt->bindParam(':room', $room);
    $stmt->execute();
    $roomData = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Generate access code or use fixed code if available
    if ($roomData && !empty($roomData['fixed_passcode'])) {
        $accessCode = $roomData['fixed_passcode'];
    } else {
        // Generate a random 6-digit access code
        $accessCode = mt_rand(100000, 999999);
    }
    
    // Prepare SQL statement
    $stmt = $conn->prepare("INSERT INTO bookings (room_id, guest_name, email, phone, arrival_datetime, departure_datetime, access_code) 
                            VALUES (:room, :name, :email, :phone, :arrival, :departure, :access_code)");
    
    // Bind parameters
    $stmt->bindParam(':room', $room);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':arrival', $arrivalDateTime);
    $stmt->bindParam(':departure', $departureDateTime);
    $stmt->bindParam(':access_code', $accessCode);
    
    // Execute the statement
    $stmt->execute();
    
    // Get room name for notification
    $stmt = $conn->prepare("SELECT name FROM rooms WHERE id = :room");
    $stmt->bindParam(':room', $room);
    $stmt->execute();
    $roomName = $stmt->fetch(PDO::FETCH_ASSOC)['name'] ?? $room;
    
    // Get notification settings
    $stmt = $conn->prepare("SELECT * FROM notification_settings LIMIT 1");
    $stmt->execute();
    $notificationSettings = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Check if email notifications are enabled
    if ($notificationSettings && $notificationSettings['email_enabled']) {
        // Get email template and replace placeholders
        $emailTemplate = $notificationSettings['email_template'];
        $emailTemplate = str_replace('{GUEST_NAME}', $name, $emailTemplate);
        $emailTemplate = str_replace('{ROOM_NAME}', $roomName, $emailTemplate);
        $emailTemplate = str_replace('{ARRIVAL_DATETIME}', $arrivalDateTime, $emailTemplate);
        $emailTemplate = str_replace('{DEPARTURE_DATETIME}', $departureDateTime, $emailTemplate);
        $emailTemplate = str_replace('{ACCESS_CODE}', $accessCode, $emailTemplate);
        
        // Set email parameters
        $to = $email;
        $subject = "Your Booking Confirmation";
        $message = $emailTemplate;
        
        // Set content-type header for sending HTML email
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: noreply@example.com" . "\r\n";
        
        // Send email (commented out for testing)
        // mail($to, $subject, $message, $headers);
    }
    
    // Check if SMS notifications are enabled
    if ($notificationSettings && $notificationSettings['sms_enabled']) {
        // Get SMS template and replace placeholders
        $smsTemplate = $notificationSettings['sms_template'];
        $smsTemplate = str_replace('{GUEST_NAME}', $name, $smsTemplate);
        $smsTemplate = str_replace('{ROOM_NAME}', $roomName, $smsTemplate);
        $smsTemplate = str_replace('{ARRIVAL_DATETIME}', $arrivalDateTime, $smsTemplate);
        $smsTemplate = str_replace('{DEPARTURE_DATETIME}', $departureDateTime, $smsTemplate);
        $smsTemplate = str_replace('{ACCESS_CODE}', $accessCode, $smsTemplate);
        
        // SMS API integration would go here
        // For now, we'll just log that we would send an SMS
        error_log("Would send SMS to $phone: $smsTemplate");
    }
    
    // Return success response
    echo json_encode([
        'success' => true, 
        'message' => 'Booking created successfully', 
        'data' => [
            'bookingId' => $conn->lastInsertId(),
            'accessCode' => $accessCode
        ]
    ]);
    
} catch(PDOException $e) {
    // Return error response
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
