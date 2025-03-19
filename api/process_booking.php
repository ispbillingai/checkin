
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
$entryPoints = isset($_POST['entryPoints']) ? json_decode($_POST['entryPoints'], true) : [];
$arrivalDateTime = $_POST['arrivalDateTime'] ?? '';
$departureDateTime = $_POST['departureDateTime'] ?? '';
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$phone = $_POST['phone'] ?? '';
$pinPosition = isset($_POST['pinPosition']) ? intval($_POST['pinPosition']) : null;
$pinCode = isset($_POST['pinCode']) ? secure_input($_POST['pinCode']) : '';
$autoGeneratePin = isset($_POST['autoGeneratePin']) && $_POST['autoGeneratePin'] == 'true';

// For backwards compatibility, if entryPoints is not set but entryPoint is
if (empty($entryPoints) && isset($_POST['entryPoint']) && !empty($_POST['entryPoint'])) {
    $entryPoints = [$_POST['entryPoint']];
}

// Validate input
if (empty($room) || empty($entryPoints) || empty($arrivalDateTime) || empty($departureDateTime) || empty($name) || empty($email) || empty($phone)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required, including at least one entry point']);
    exit;
}

// Validate that all specified entry points are available for the room
foreach ($entryPoints as $entryPoint) {
    $stmt = $conn->prepare("SELECT * FROM room_entry_points WHERE room_id = ? AND entry_point_id = ?");
    $stmt->bind_param("ss", $room, $entryPoint);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false, 
            'message' => 'Entry point ' . $entryPoint . ' is not available for this room'
        ]);
        exit;
    }
}

try {
    // Use transaction to ensure data consistency
    $conn->begin_transaction();
    
    // Get primary entry point (first in the list)
    $primaryEntryPoint = $entryPoints[0];
    
    // Prepare SQL statement to check for room's fixed passcode
    $stmt = $conn->prepare("SELECT name, fixed_passcode FROM rooms WHERE id = ?");
    $stmt->bind_param("s", $room);
    $stmt->execute();
    $result = $stmt->get_result();
    $roomData = $result->fetch_assoc();
    
    // Get entry point names for display
    $entryPointNames = [];
    foreach ($entryPoints as $entryPoint) {
        $stmt = $conn->prepare("SELECT name FROM entry_points WHERE id = ?");
        $stmt->bind_param("s", $entryPoint);
        $stmt->execute();
        $entryResult = $stmt->get_result();
        $entryData = $entryResult->fetch_assoc();
        $entryPointNames[$entryPoint] = $entryData['name'] ?? $entryPoint;
    }
    
    // Determine access code (PIN) to use
    if (!empty($pinCode) && !$autoGeneratePin) {
        // Use provided PIN code
        $accessCode = $pinCode;
    } else if ($roomData && !empty($roomData['fixed_passcode'])) {
        // Use the room's fixed passcode
        $accessCode = $roomData['fixed_passcode'];
    } else {
        // Generate a random 4-digit access code by default
        $accessCode = sprintf("%04d", mt_rand(0, 9999));
    }
    
    $roomName = $roomData['name'] ?? $room;
    
    // Insert booking into database with primary entry point
    $stmt = $conn->prepare("INSERT INTO bookings (room_id, entry_point_id, guest_name, email, phone, arrival_datetime, departure_datetime, access_code) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssssss", $room, $primaryEntryPoint, $name, $email, $phone, $arrivalDateTime, $departureDateTime, $accessCode);
    $stmt->execute();
    
    if ($stmt->affected_rows > 0) {
        $bookingId = $conn->insert_id;
        
        // Assign the PIN code to all selected entry points
        $success = assign_pin_to_entry_points($bookingId, $entryPoints, $accessCode, $pinPosition);
        
        if (!$success) {
            // Roll back the transaction
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'Error assigning PIN code to entry points']);
            exit;
        }
        
        // Get notification settings
        $query = "SELECT * FROM notification_settings LIMIT 1";
        $result = $conn->query($query);
        $notificationSettings = $result->fetch_assoc();
        
        // Format entry point names for display
        $entryPointNamesList = implode(', ', array_values($entryPointNames));
        
        // Check if email notifications are enabled
        if ($notificationSettings && $notificationSettings['email_enabled']) {
            // Get email template and replace placeholders
            $emailTemplate = $notificationSettings['email_template'];
            $emailTemplate = str_replace('{GUEST_NAME}', $name, $emailTemplate);
            $emailTemplate = str_replace('{ROOM_NAME}', $roomName, $emailTemplate);
            $emailTemplate = str_replace('{ENTRY_POINT_NAME}', $entryPointNamesList, $emailTemplate);
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
            $smsTemplate = str_replace('{ENTRY_POINT_NAME}', $entryPointNamesList, $smsTemplate);
            $smsTemplate = str_replace('{ARRIVAL_DATETIME}', $arrivalDateTime, $smsTemplate);
            $smsTemplate = str_replace('{DEPARTURE_DATETIME}', $departureDateTime, $smsTemplate);
            $smsTemplate = str_replace('{ACCESS_CODE}', $accessCode, $smsTemplate);
            
            // SMS API integration would go here
            error_log("SMS would be sent to $phone: $smsTemplate");
        }
        
        // Commit the transaction
        $conn->commit();
        
        // Return success response
        echo json_encode([
            'success' => true, 
            'message' => 'Booking created successfully', 
            'data' => [
                'bookingId' => $bookingId,
                'accessCode' => $accessCode,
                'roomName' => $roomName,
                'entryPoints' => $entryPointNames,
                'pinPosition' => $pinPosition
            ]
        ]);
    } else {
        // Roll back the transaction
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Error creating booking: ' . $stmt->error]);
    }
} catch(Exception $e) {
    // Roll back the transaction
    if ($conn->connect_errno === 0) {
        $conn->rollback();
    }
    
    // Return error response
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

// Close connection
$conn->close();
?>
