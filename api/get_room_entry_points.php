
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
    // Query to get entry points for the specified room
    $query = "SELECT e.id, e.name, e.description, e.ip_address
              FROM entry_points e
              JOIN room_entry_points re ON e.id = re.entry_point_id
              WHERE re.room_id = ?
              ORDER BY e.name";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $room_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $entry_points = [];
    while ($row = $result->fetch_assoc()) {
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
