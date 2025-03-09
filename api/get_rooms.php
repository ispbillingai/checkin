
<?php
// Include database configuration
require_once 'db_config.php';

// Start session
session_start();

// For development/testing purposes - provide dummy data for unauthenticated users
// This helps prevent the "Failed to load rooms" error on the home page
if (!isset($_SESSION['user_id'])) {
    // Return sample rooms data for non-authenticated users
    echo json_encode([
        'success' => true,
        'rooms' => [
            [
                'id' => 'demo1',
                'name' => 'Demo Room 1'
            ],
            [
                'id' => 'demo2',
                'name' => 'Demo Room 2'
            ],
            [
                'id' => 'demo3',
                'name' => 'Demo Room 3'
            ]
        ],
        'is_demo' => true
    ]);
    exit;
}

// Handle get rooms request
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Prepare SQL statement
    $stmt = $conn->prepare("SELECT id, name FROM rooms ORDER BY name ASC");
    $stmt->execute();
    $result = $stmt->get_result();
    
    $rooms = [];
    while ($row = $result->fetch_assoc()) {
        $rooms[] = [
            'id' => $row['id'],
            'name' => $row['name']
        ];
    }
    
    // Return rooms as JSON
    echo json_encode([
        'success' => true,
        'rooms' => $rooms
    ]);
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
