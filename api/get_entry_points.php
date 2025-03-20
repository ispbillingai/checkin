<?php
// get_entry_points.php
require_once 'db_config.php';  // Ensure this file sets $conn = new mysqli(...)

header('Content-Type: application/json');

try {
    // Only handle GET
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid request method'
        ]);
        exit;
    }

    // Query your table (make sure it's spelled exactly "entry_points")
    $sql = "SELECT * FROM entry_points ORDER BY name";
    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("Query error: " . $conn->error);
    }

    $entry_points = [];
    while ($row = $result->fetch_assoc()) {
        $entry_points[] = [
            'id'          => $row['id'],
            'name'        => $row['name'],
            'description' => $row['description']
        ];
    }

    echo json_encode([
        'success'      => true,
        'entry_points' => $entry_points
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    $conn->close();
}
