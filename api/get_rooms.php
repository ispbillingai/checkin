
<?php
// Include database configuration
require_once 'db_config.php';

// Start session
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'User not authenticated'
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
