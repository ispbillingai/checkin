
<?php
// Include database configuration
require_once 'db_config.php';

// Set content type to JSON
header('Content-Type: application/json');

// Simple error logging focused only on entry points
error_log("get_entry_points.php called");

// Handle GET request to fetch all entry points
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    try {
        // Just get all entry points (no filtering by room_id)
        error_log("Fetching all entry points");
        $query = "SELECT * FROM entry_points ORDER BY name";
        $result = $conn->query($query);
        
        if (!$result) {
            error_log("SQL Error in get_entry_points.php: " . $conn->error);
        }
        
        $entry_points = [];
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $entry_points[] = [
                    'id' => $row['id'],
                    'name' => $row['name'],
                    'description' => $row['description']
                ];
            }
        }
        
        error_log("Found " . count($entry_points) . " entry points");
        
        // If no entry points found, provide fallbacks
        if (count($entry_points) === 0) {
            error_log("No entry points found. Adding fallback data");
            
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
        
        echo json_encode([
            'success' => true,
            'entry_points' => $entry_points
        ]);
    } catch (Exception $e) {
        // Log the error for debugging
        error_log("Error in get_entry_points.php: " . $e->getMessage());
        
        echo json_encode([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}

// Close database connection
$conn->close();
?>
