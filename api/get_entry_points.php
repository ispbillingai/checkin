
<?php
require_once 'db_config.php';

// Return JSON in all cases
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

    // Build and run query
    $query = "SELECT * FROM entry_points ORDER BY name";
    $result = $conn->query($query);

    // Check for SQL errors
    if (!$result) {
        throw new Exception("SQL Error: " . $conn->error);
    }

    // Fetch results
    $entry_points = [];
    while ($row = $result->fetch_assoc()) {
        $entry_points[] = [
            'id'          => $row['id'],
            'name'        => $row['name'],
            'description' => $row['description']
        ];
    }

    // Return data
    echo json_encode([
        'success' => true,
        'entry_points' => $entry_points
    ]);

} catch (Exception $e) {
    // On any exception, return an error
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    exit;
}

// Close the DB connection
$conn->close();
