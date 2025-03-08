
<?php
// Start session
session_start();

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

// Include database configuration
require_once 'db_config.php';

// Check if it's a GET request
if ($_SERVER["REQUEST_METHOD"] != "GET") {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get room ID from request
$id = secure_input($_GET['id'] ?? '');

// Validate input
if (empty($id)) {
    echo json_encode(['success' => false, 'message' => 'Room ID is required']);
    exit;
}

// Get room details
$stmt = $conn->prepare("SELECT * FROM rooms WHERE id = ?");
$stmt->bind_param("s", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $room = $result->fetch_assoc();
    echo json_encode(['success' => true, 'room' => $room]);
} else {
    echo json_encode(['success' => false, 'message' => 'Room not found']);
}

// Close connection
$conn->close();
?>
