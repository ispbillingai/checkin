
<?php
header('Content-Type: application/json');

// Include database configuration
require_once '../php/db_config.php';

try {
    // If we've reached this point, the connection has been established (in db_config.php)
    $response = [
        'success' => true,
        'message' => 'Database connection successful',
        'timestamp' => date('Y-m-d H:i:s')
    ];
} catch (Exception $e) {
    $response = [
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ];
}

echo json_encode($response);
?>
