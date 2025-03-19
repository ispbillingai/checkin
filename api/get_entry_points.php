
<?php
// Include database configuration
require_once 'db_config.php';

// Set content type to JSON
header('Content-Type: application/json');

// Handle GET request to fetch all entry points
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    try {
        if (isset($_GET['room_id'])) {
            // If room_id is provided, get entry points for that specific room
            $room_id = secure_input($_GET['room_id']);
            
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
        
        echo json_encode([
            'success' => true,
            'entry_points' => $entry_points
        ]);
    } catch (Exception $e) {
        // Log the error for debugging
        log_error("Error in get_entry_points.php: " . $e->getMessage());
        
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
