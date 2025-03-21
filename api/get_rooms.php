
<?php
// Include database configuration
require_once '../php/db_config.php';

// Set the response header to JSON
header('Content-Type: application/json');

try {
    // Query to get all rooms
    $query = "SELECT id, name, description, fixed_passcode, reset_hours, ip_address 
              FROM rooms
              ORDER BY name";
    
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception("Error executing query: " . $conn->error);
    }
    
    $rooms = [];
    while ($row = $result->fetch_assoc()) {
        $rooms[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'rooms' => $rooms
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
