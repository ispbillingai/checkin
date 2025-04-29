
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
    // Query to get ALL entry points (not just associated ones)
    // So that users can choose which ones they want to enable for this room
    $query = "SELECT e.id, e.name, e.description, e.ip_address,
              (SELECT COUNT(*) FROM room_entry_points re WHERE re.entry_point_id = e.id AND re.room_id = ?) as is_associated
              FROM entry_points e
              ORDER BY e.name";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $room_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $entry_points = [];
    while ($row = $result->fetch_assoc()) {
        // Convert is_associated to boolean for easier handling in JavaScript
        $row['is_associated'] = ($row['is_associated'] > 0);
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
