
<?php
// Include database configuration
require_once 'db_config.php';

// Set content type to JSON
header('Content-Type: application/json');

// Get entry point ID from GET parameters
$id = isset($_GET['id']) ? secure_input($_GET['id']) : '';

if (empty($id)) {
    echo json_encode([
        'success' => false,
        'message' => 'Entry point ID is required'
    ]);
    exit;
}

try {
    // Get entry point details
    $stmt = $conn->prepare("SELECT * FROM entry_points WHERE id = ?");
    $stmt->bind_param("s", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows == 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Entry point not found'
        ]);
        exit;
    }
    
    $entry_point = $result->fetch_assoc();
    
    // Get connected rooms
    $stmt = $conn->prepare("SELECT room_id FROM room_entry_points WHERE entry_point_id = ?");
    $stmt->bind_param("s", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $connected_rooms = [];
    while ($row = $result->fetch_assoc()) {
        $connected_rooms[] = $row['room_id'];
    }
    
    $entry_point['connected_rooms'] = $connected_rooms;
    
    echo json_encode([
        'success' => true,
        'entry_point' => $entry_point
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

// Close connection
$conn->close();
?>
