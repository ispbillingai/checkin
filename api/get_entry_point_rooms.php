
<?php
// Include database configuration
require_once '../php/db_config.php';

// Set response headers
header('Content-Type: application/json');

// Check if entry_point_id parameter is provided
if (!isset($_GET['entry_point_id']) || empty($_GET['entry_point_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Entry point ID is required'
    ]);
    exit;
}

$entry_point_id = $_GET['entry_point_id'];

try {
    // Query to get all rooms associated with this entry point
    $query = "SELECT r.id, r.name, r.description
              FROM rooms r
              JOIN room_entry_points rep ON r.id = rep.room_id
              WHERE rep.entry_point_id = ?";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $entry_point_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $rooms = [];
    while ($row = $result->fetch_assoc()) {
        $rooms[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'description' => $row['description']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'rooms' => $rooms
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
