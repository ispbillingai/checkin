<?php
// Enable error display for development (remove these lines in production)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Set a custom error log file in the root folder.
// __DIR__ gives the current directory (/var/www/html/checkin/api), so we go one level up:
ini_set('error_log', __DIR__ . '/../custom_error.log');

// Log that the custom error log file is set:
error_log("[get_entry_points.php] Custom error log set: " . ini_get('error_log'));

// Load DB config
require_once 'db_config.php';

// Return JSON always
header('Content-Type: application/json');

try {
    // Check the request method
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        error_log("[get_entry_points.php] Invalid request method: " . $_SERVER['REQUEST_METHOD']);
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
        exit;
    }
    
    // Query your table
    $query = "SELECT * FROM entry_points ORDER BY name";
    error_log("[get_entry_points.php] Running query: $query");

    $result = $conn->query($query);
    if (!$result) {
        error_log("[get_entry_points.php] SQL error: " . $conn->error);
        throw new Exception("Database query failed: " . $conn->error);
    }

    // Gather rows
    $entry_points = [];
    while ($row = $result->fetch_assoc()) {
        $entry_points[] = [
            'id'          => $row['id'],
            'name'        => $row['name'],
            'description' => $row['description'],
        ];
    }

    error_log("[get_entry_points.php] Found " . count($entry_points) . " rows");
    
    // Return success JSON
    echo json_encode([
        'success'      => true,
        'entry_points' => $entry_points
    ]);

} catch (Exception $e) {
    error_log("[get_entry_points.php] Exception: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    $conn->close();
    error_log("[get_entry_points.php] Connection closed");
}
