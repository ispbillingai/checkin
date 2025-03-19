
<?php
// Include database configuration
require_once 'db_config.php';

// Set content type to JSON
header('Content-Type: application/json');

// Enhanced error logging for entry points API
error_log("[get_entry_points.php] API called");

// Handle GET request to fetch all entry points
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    try {
        // Get room_id from query parameters if provided
        $room_id = isset($_GET['room_id']) ? $_GET['room_id'] : null;
        
        if ($room_id) {
            error_log("[get_entry_points.php] Fetching entry points for room_id: " . $room_id);
            // TODO: In the future, we would filter by room_id
            // For now, just get all entry points regardless of room_id parameter
        } else {
            error_log("[get_entry_points.php] Fetching all entry points");
        }
        
        // Query to get all entry points
        $query = "SELECT * FROM entry_points ORDER BY name";
        error_log("[get_entry_points.php] Executing SQL: " . $query);
        $result = $conn->query($query);
        
        if (!$result) {
            error_log("[get_entry_points.php] SQL Error: " . $conn->error);
            throw new Exception("Database query failed: " . $conn->error);
        }
        
        $entry_points = [];
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $entry_points[] = [
                    'id' => $row['id'],
                    'name' => $row['name'],
                    'description' => $row['description']
                ];
            }
        }
        
        error_log("[get_entry_points.php] Found " . count($entry_points) . " entry points");
        
        echo json_encode([
            'success' => true,
            'entry_points' => $entry_points
        ]);
    } catch (Exception $e) {
        // Log the error for debugging
        error_log("[get_entry_points.php] Error: " . $e->getMessage());
        
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
