
<?php
// Include database configuration
require_once 'db_config.php';

// Start session
session_start();

// Check if user is authenticated and is admin
if (!isset($_SESSION['user_id']) && !($_SERVER['HTTP_HOST'] == 'localhost' || $_SERVER['HTTP_HOST'] == '127.0.0.1')) {
    // Return error for unauthenticated users
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access'
    ]);
    exit;
}

// Handle GET request for a specific room
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Validate room ID parameter
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Room ID is required'
        ]);
        exit;
    }
    
    $room_id = trim($_GET['id']);
    
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
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}

// Close database connection
$conn->close();
?>
