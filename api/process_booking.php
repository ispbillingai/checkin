
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
    // Prepare SQL statement to check for room's fixed passcode
    $stmt = $conn->prepare("SELECT name, fixed_passcode FROM rooms WHERE id = ?");
    $stmt->bind_param("s", $room);
    $stmt->execute();
    $result = $stmt->get_result();
    $roomData = $result->fetch_assoc();
    
    // Generate access code or use fixed code if available
    if ($roomData && !empty($roomData['fixed_passcode'])) {
        $accessCode = $roomData['fixed_passcode'];
    } else {
        // Generate a random 6-digit access code
        $accessCode = generate_access_code();
    }
    
    $roomName = $roomData['name'] ?? $room;
    
    // Insert booking into database
    $stmt = $conn->prepare("INSERT INTO bookings (room_id, guest_name, email, phone, arrival_datetime, departure_datetime, access_code) 
                            VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssss", $room, $name, $email, $phone, $arrivalDateTime, $departureDateTime, $accessCode);
    $stmt->execute();
    
    if ($stmt->affected_rows > 0) {
        $bookingId = $conn->insert_id;
        
        // Get notification settings
        $query = "SELECT * FROM notification_settings LIMIT 1";
        $result = $conn->query($query);
        $notificationSettings = $result->fetch_assoc();
        
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
            error_log("Email would be sent to $email with access code $accessCode");
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
            error_log("SMS would be sent to $phone: $smsTemplate");
        }
        
        // Return success response
        echo json_encode([
            'success' => true, 
            'message' => 'Booking created successfully', 
            'data' => [
                'bookingId' => $bookingId,
                'accessCode' => $accessCode
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error creating booking: ' . $stmt->error]);
    }
} catch(Exception $e) {
    // Return error response
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

// Close connection
$conn->close();
?>
