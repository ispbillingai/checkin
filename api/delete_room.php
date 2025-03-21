
<?php
// Include database configuration
require_once '../php/db_config.php';

// Set the response header to JSON
header('Content-Type: application/json');

// Get JSON data from request
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

if (!$data || empty($data['id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Room ID is required'
    ]);
    exit;
}

// Sanitize input
$room_id = secure_input($data['id']);

try {
    // Check if room exists
    $check_query = "SELECT id FROM rooms WHERE id = ?";
    $check_stmt = $conn->prepare($check_query);
    $check_stmt->bind_param("s", $room_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Room not found'
        ]);
        exit;
    }
    
    // Check if room has active bookings
    $bookings_query = "SELECT id FROM bookings WHERE room_id = ? AND status = 'active'";
    $bookings_stmt = $conn->prepare($bookings_query);
    $bookings_stmt->bind_param("s", $room_id);
    $bookings_stmt->execute();
    $bookings_result = $bookings_stmt->get_result();
    
    if ($bookings_result->num_rows > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Cannot delete room with active bookings'
        ]);
        exit;
    }
    
    // Delete associated mappings from room_entry_points
    $delete_mappings_query = "DELETE FROM room_entry_points WHERE room_id = ?";
    $delete_mappings_stmt = $conn->prepare($delete_mappings_query);
    $delete_mappings_stmt->bind_param("s", $room_id);
    $delete_mappings_stmt->execute();
    
    // Delete room
    $delete_query = "DELETE FROM rooms WHERE id = ?";
    $delete_stmt = $conn->prepare($delete_query);
    $delete_stmt->bind_param("s", $room_id);
    
    if ($delete_stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Room deleted successfully'
        ]);
    } else {
        throw new Exception("Error deleting room: " . $conn->error);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
