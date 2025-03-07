<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database configuration
require_once 'db_config.php';

error_log("Verify access endpoint hit");

// Handle verify access request
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Get and log parameters
    $room_id = isset($_GET['room']) ? secure_input($_GET['room']) : '';
    $code = isset($_GET['code']) ? secure_input($_GET['code']) : '';
    
    error_log("Verifying access - Room ID: $room_id, Code length: " . strlen($code));
    
    if (empty($room_id) || empty($code)) {
        error_log("Missing parameters - Room ID or Code");
        echo json_encode([
            'success' => false,
            'message' => 'Missing parameters'
        ]);
        exit;
    }
    
    try {
        // Get current datetime
        $now = date('Y-m-d H:i:s');
        error_log("Checking access for current time: $now");
        
        // Prepare SQL statement
        $stmt = $conn->prepare("SELECT * FROM bookings WHERE room_id = ? AND access_code = ? AND arrival_date_time <= ? AND departure_date_time >= ?");
        if (!$stmt) {
            error_log("Failed to prepare statement: " . $conn->error);
            throw new Exception("Database prepare failed");
        }
        
        $stmt->bind_param("ssss", $room_id, $code, $now, $now);
        if (!$stmt->execute()) {
            error_log("Failed to execute statement: " . $stmt->error);
            throw new Exception("Database execute failed");
        }
        
        $result = $stmt->get_result();
        error_log("Query executed. Found matches: " . $result->num_rows);
        
        if ($result->num_rows > 0) {
            $booking = $result->fetch_assoc();
            error_log("Access granted for booking ID: " . $booking['id']);
            
            echo json_encode([
                'success' => true,
                'message' => 'Access granted',
                'booking' => [
                    'guestName' => $booking['guest_name'],
                    'arrivalDateTime' => $booking['arrival_date_time'],
                    'departureDateTime' => $booking['departure_date_time']
                ]
            ]);
        } else {
            error_log("Access denied - No valid booking found for Room: $room_id, Code: $code");
            echo json_encode([
                'success' => false,
                'message' => 'Access denied: Invalid code or expired booking'
            ]);
        }
    } catch (Exception $e) {
        error_log("Exception in verify_access.php: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Server error occurred'
        ]);
    }
} else {
    error_log("Invalid request method to verify_access.php: " . $_SERVER["REQUEST_METHOD"]);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}

$conn->close();
error_log("Connection closed in verify_access.php");
?>
