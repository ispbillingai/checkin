<?php
// Include database configuration
require_once 'db_config.php';

// Set content type to JSON
header('Content-Type: application/json');

// Add detailed error logging
error_log("Fetching entry points");

// Handle GET request to fetch all entry points
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    try {
        if (isset($_GET['room_id'])) {
            // If room_id is provided, get entry points for that specific room
            $room_id = secure_input($_GET['room_id']);
            error_log("Fetching entry points for room: " . $room_id);
            
            $query = "SELECT ep.* FROM entry_points ep 
                     JOIN room_entry_points rep ON ep.id = rep.entry_point_id 
                     WHERE rep.room_id = ?
                     ORDER BY ep.name";
            
            $stmt = $conn->prepare($query);
            $stmt->bind_param("s", $room_id);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            // Otherwise, get all entry points
            error_log("Fetching all entry points");
            $query = "SELECT * FROM entry_points ORDER BY name";
            $result = $conn->query($query);
        }
        
        $entry_points = [];
        while ($row = $result->fetch_assoc()) {
            $entry_points[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'description' => $row['description']
            ];
        }
        
        error_log("Found " . count($entry_points) . " entry points");
        
        // If no entry points found and this is a room-specific request, provide fallbacks
        if (count($entry_points) === 0 && isset($_GET['room_id'])) {
            error_log("No entry points found for room " . $_GET['room_id'] . ". Adding fallback data");
            
            // Get the default entry points
            $query = "SELECT * FROM entry_points ORDER BY name LIMIT 3";
            $result = $conn->query($query);
            
            while ($row = $result->fetch_assoc()) {
                $entry_points[] = [
                    'id' => $row['id'],
                    'name' => $row['name'],
                    'description' => $row['description']
                ];
            }
            
            // If still no entry points, create demo ones
            if (count($entry_points) === 0) {
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
        }
        
        echo json_encode([
            'success' => true,
            'entry_points' => $entry_points,
            'debug_info' => [
                'count' => count($entry_points),
                'room_id' => isset($_GET['room_id']) ? $_GET['room_id'] : 'all',
                'timestamp' => date('Y-m-d H:i:s')
            ]
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
