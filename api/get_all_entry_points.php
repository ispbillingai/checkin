
<?php
// Start session
session_start();

// Include database configuration
require_once 'db_config.php';

// Set content type header
header('Content-Type: application/json');

// Add detailed error logging
error_log("get_all_entry_points.php called");

// Check if user is logged in (only required for admin functions)
if (!isset($_SESSION['user_id']) && !($_SERVER['HTTP_HOST'] == 'localhost' || $_SERVER['HTTP_HOST'] == '127.0.0.1')) {
    echo json_encode([
        'success' => false,
        'message' => 'User not authenticated'
    ]);
    exit;
}

try {
    // Prepare SQL statement to get all entry points
    $sql = "SELECT id, name, description FROM entry_points ORDER BY name";
    $stmt = $conn->prepare($sql);

    // Execute the query
    $stmt->execute();
    $result = $stmt->get_result();
    $entry_points = [];

    // Fetch all entry points
    while ($row = $result->fetch_assoc()) {
        $entry_points[] = $row;
    }

    // Log the number of entry points found
    error_log("Found " . count($entry_points) . " entry points");

    // If no entry points found, provide demo data for testing
    if (count($entry_points) === 0 && ($_SERVER['HTTP_HOST'] == 'localhost' || $_SERVER['HTTP_HOST'] == '127.0.0.1')) {
        error_log("No entry points found, providing demo data");
        $entry_points = [
            [
                'id' => 'entry1',
                'name' => 'Main Entrance',
                'description' => 'Front door at the main lobby'
            ],
            [
                'id' => 'entry2',
                'name' => 'Side Entrance',
                'description' => 'Side entrance near the parking lot'
            ],
            [
                'id' => 'entry3',
                'name' => 'Back Entrance',
                'description' => 'Back entrance near the garden'
            ]
        ];
    }

    // Return success response
    echo json_encode([
        'success' => true,
        'entry_points' => $entry_points,
        'debug_info' => [
            'count' => count($entry_points),
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
} catch (Exception $e) {
    // Log the error
    error_log("Error in get_all_entry_points.php: " . $e->getMessage());
    
    // Return error response
    echo json_encode([
        'success' => false,
        'message' => 'Error retrieving entry points: ' . $e->getMessage()
    ]);
}

// Close connection
$conn->close();
?>
