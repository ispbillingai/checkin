
<?php
// Set content type to JSON
header('Content-Type: application/json');

try {
    // Include database configuration
    require_once 'db_config.php';
    
    // If we get here, connection was successful
    // Try a simple query to verify database functionality
    $query = "SELECT 1";
    $result = $conn->query($query);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Database connection is working properly'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Connected but query failed: ' . $conn->error
        ]);
    }
    
    // Close the connection
    $conn->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Connection failed: ' . $e->getMessage()
    ]);
}
?>
