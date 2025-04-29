
<?php
// Include database configuration
require_once '../php/db_config.php';

// Set the response header to JSON
header('Content-Type: application/json');

// Get room ID from query parameter
$room_id = isset($_GET['room_id']) ? secure_input($_GET['room_id']) : '';

if (empty($room_id)) {
    echo json_encode([
        'success' => false,
        'message' => 'Room ID is required'
    ]);
    exit;
}

try {
    // First, get all entry points
    $all_query = "SELECT id, name, description, ip_address FROM entry_points ORDER BY name";
    $all_result = $conn->query($all_query);
    
    // Get the entry points that are specifically associated with this room
    $room_query = "SELECT entry_point_id 
                  FROM room_entry_points 
                  WHERE room_id = ?";
    
    $stmt = $conn->prepare($room_query);
    $stmt->bind_param("s", $room_id);
    $stmt->execute();
    $room_result = $stmt->get_result();
    
    // Create an array of associated entry point IDs for easy lookup
    $associated_entry_points = [];
    while ($row = $room_result->fetch_assoc()) {
        $associated_entry_points[] = $row['entry_point_id'];
    }
    
    // Now process all entry points and add a flag if they're associated with the room
    $entry_points = [];
    while ($row = $all_result->fetch_assoc()) {
        $row['is_associated'] = in_array($row['id'], $associated_entry_points);
        $entry_points[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'entry_points' => $entry_points
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
