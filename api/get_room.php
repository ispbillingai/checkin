
<?php
// Include database configuration
require_once 'db_config.php';

// Start session
session_start();

// Check if user is authenticated and is admin
if (!isset($_SESSION['user_id']) && !($_SERVER['HTTP_HOST'] == 'localhost' || $_SERVER['HTTP_HOST'] == '127.0.0.1')) {
    // Return error for unauthenticated users
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access'
    ]);
    exit;
}

// Handle GET request for a specific room
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Add debug information
    error_log("get_room.php called - getting specific room");
    
    // Set content type to JSON
    header('Content-Type: application/json');
    
    // Validate room ID parameter
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Room ID is required'
        ]);
        exit;
    }
    
    $room_id = trim($_GET['id']);
    
    // Check if we're in demo mode and should return demo data
    $demo_mode = ($_SERVER['HTTP_HOST'] == 'localhost' || $_SERVER['HTTP_HOST'] == '127.0.0.1');
    $demo_rooms = [
        'demo1' => [
            'id' => 'demo1',
            'name' => 'Demo Single Room',
            'description' => 'A comfortable single room perfect for solo travelers.',
            'fixed_passcode' => '1234',
            'reset_hours' => 2
        ],
        'demo2' => [
            'id' => 'demo2',
            'name' => 'Demo Double Room',
            'description' => 'Spacious double room with king-size bed.',
            'fixed_passcode' => '',
            'reset_hours' => 3
        ],
        'demo3' => [
            'id' => 'demo3',
            'name' => 'Demo Suite',
            'description' => 'Luxury suite with separate living area and bedroom.',
            'fixed_passcode' => '5678',
            'reset_hours' => 4
        ]
    ];
    
    // Check if we should return demo data
    if ($demo_mode && strpos($room_id, 'demo') === 0 && isset($demo_rooms[$room_id])) {
        echo json_encode([
            'success' => true,
            'room' => $demo_rooms[$room_id]
        ]);
        exit;
    }
    
    // Prepare SQL statement to get room details
    $stmt = $conn->prepare("SELECT id, name, description, fixed_passcode, reset_hours FROM rooms WHERE id = ?");
    $stmt->bind_param("s", $room_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Room not found'
        ]);
        exit;
    }
    
    $room = $result->fetch_assoc();
    
    // Return room details as JSON
    echo json_encode([
        'success' => true,
        'room' => $room
    ]);
} else {
    // Return error for non-GET requests
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}

// Close database connection
$conn->close();
?>
