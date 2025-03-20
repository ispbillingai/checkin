
<?php
// Include database configuration
require_once 'db_config.php';

// Start session
session_start();

// Set content type to JSON first
header('Content-Type: application/json');

// Handle get rooms request
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    try {
        // Prepare SQL statement
        $stmt = $conn->prepare("SELECT id, name, description FROM rooms ORDER BY name ASC");
        $stmt->execute();
        $result = $stmt->get_result();
        
        $rooms = [];
        while ($row = $result->fetch_assoc()) {
            $rooms[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'description' => $row['description'] ?? ''
            ];
        }
        
        // Check if rooms were found
        if (count($rooms) === 0) {
            // Return sample rooms data if no rooms found
            $rooms = [
                [
                    'id' => 'demo1',
                    'name' => 'Demo Room 1',
                    'description' => 'This is a sample room for demonstration purposes.'
                ],
                [
                    'id' => 'demo2',
                    'name' => 'Demo Room 2',
                    'description' => 'Another sample room for demonstration.'
                ],
                [
                    'id' => 'demo3',
                    'name' => 'Demo Room 3',
                    'description' => 'A third sample room option.'
                ]
            ];
        }
        
        // Return rooms as JSON with debugging info
        echo json_encode([
            'success' => true,
            'rooms' => $rooms,
            'debug_info' => [
                'room_count' => count($rooms),
                'timestamp' => date('Y-m-d H:i:s')
            ]
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching rooms: ' . $e->getMessage()
        ]);
    }
} else {
    // Return error for non-GET requests
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}

// Close database connection
$conn->close();
?>
