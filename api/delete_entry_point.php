
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
        'message' => 'Entry Point ID is required'
    ]);
    exit;
}

// Sanitize input
$entry_point_id = secure_input($data['id']);

try {
    // Check if entry point exists
    $check_query = "SELECT id FROM entry_points WHERE id = ?";
    $check_stmt = $conn->prepare($check_query);
    $check_stmt->bind_param("s", $entry_point_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Entry Point not found'
        ]);
        exit;
    }
    
    // Check if entry point has active bookings
    $bookings_query = "SELECT id FROM bookings WHERE entry_point_id = ? AND status = 'active'";
    $bookings_stmt = $conn->prepare($bookings_query);
    $bookings_stmt->bind_param("s", $entry_point_id);
    $bookings_stmt->execute();
    $bookings_result = $bookings_stmt->get_result();
    
    if ($bookings_result->num_rows > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Cannot delete entry point with active bookings'
        ]);
        exit;
    }
    
    // Delete associated mappings from room_entry_points
    $delete_mappings_query = "DELETE FROM room_entry_points WHERE entry_point_id = ?";
    $delete_mappings_stmt = $conn->prepare($delete_mappings_query);
    $delete_mappings_stmt->bind_param("s", $entry_point_id);
    $delete_mappings_stmt->execute();
    
    // Delete entry point
    $delete_query = "DELETE FROM entry_points WHERE id = ?";
    $delete_stmt = $conn->prepare($delete_query);
    $delete_stmt->bind_param("s", $entry_point_id);
    
    if ($delete_stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Entry Point deleted successfully'
        ]);
    } else {
        throw new Exception("Error deleting entry point: " . $conn->error);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
