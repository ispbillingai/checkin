
<?php
// Include database configuration
require_once 'db_config.php';

// Handle verify access request
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Get parameters
    $room_id = isset($_GET['room']) ? secure_input($_GET['room']) : '';
    $code = isset($_GET['code']) ? secure_input($_GET['code']) : '';
    
    if (empty($room_id) || empty($code)) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing parameters'
        ]);
        exit;
    }
    
    // Get current datetime
    $now = date('Y-m-d H:i:s');
    
    // Prepare SQL statement
    $stmt = $conn->prepare("SELECT * FROM bookings WHERE room_id = ? AND access_code = ? AND arrival_date_time <= ? AND departure_date_time >= ?");
    $stmt->bind_param("ssss", $room_id, $code, $now, $now);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $booking = $result->fetch_assoc();
        
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
        echo json_encode([
            'success' => false,
            'message' => 'Access denied: Invalid code or expired booking'
        ]);
    }
} else {
    // Return error for non-GET requests
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}

// Close database connection
$conn->close();
?>
