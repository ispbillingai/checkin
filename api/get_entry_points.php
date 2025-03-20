<?php
// get_entry_points.php

// 1) Enable error display in dev (remove in production):
ini_set('display_errors', 1);
error_reporting(E_ALL);

// 2) Write a startup log for debugging:
error_log("[get_entry_points.php] Script called");

// Load DB config
require_once 'db_config.php';

// Return JSON always
header('Content-Type: application/json');

try {
    // 3) Check the request method
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        error_log("[get_entry_points.php] Invalid request method: " . $_SERVER['REQUEST_METHOD']);
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
        exit;
    }
    
    // 4) Query your table
    $query = "SELECT * FROM entry_points ORDER BY name";
    error_log("[get_entry_points.php] Running query: $query");

    $result = $conn->query($query);
    if (!$result) {
        // Log the SQL error
        error_log("[get_entry_points.php] SQL error: " . $conn->error);
        throw new Exception("Database query failed: " . $conn->error);
    }

    // 5) Gather rows
    $entry_points = [];
    while ($row = $result->fetch_assoc()) {
        $entry_points[] = [
            'id'          => $row['id'],
            'name'        => $row['name'],
            'description' => $row['description'],
        ];
    }

    error_log("[get_entry_points.php] Found " . count($entry_points) . " rows");
    
    // 6) Return success JSON
    echo json_encode([
        'success'      => true,
        'entry_points' => $entry_points
    ]);

} catch (Exception $e) {
    // 7) On exception, log and return error
    error_log("[get_entry_points.php] Exception: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    // 8) Close DB connection
    $conn->close();
    error_log("[get_entry_points.php] Connection closed");
}
