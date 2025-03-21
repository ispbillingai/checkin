
<?php
// Include database configuration
require_once '../php/db_config.php';

// Set the response header to JSON
header('Content-Type: application/json');

try {
    // Query to get all entry points
    $query = "SELECT id, name, description, ip_address 
              FROM entry_points
              ORDER BY name";
    
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception("Error executing query: " . $conn->error);
    }
    
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
