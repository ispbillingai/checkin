
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

// Check if it's a POST request
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get action from POST data
$action = $_POST['action'] ?? '';

// Handle different actions
switch ($action) {
    case 'create':
        createRoom();
        break;
    case 'update':
        updateRoom();
        break;
    case 'delete':
        deleteRoom();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

// Function to create a new room
function createRoom() {
    global $conn;
    
    // Get form data
    $id = secure_input($_POST['id'] ?? '');
    $name = secure_input($_POST['name'] ?? '');
    $description = secure_input($_POST['description'] ?? '');
    $fixed_passcode = secure_input($_POST['fixed_passcode'] ?? '');
    $reset_hours = intval($_POST['reset_hours'] ?? 2);
    
    // Validate input
    if (empty($id) || empty($name)) {
        echo json_encode(['success' => false, 'message' => 'Room ID and name are required']);
        exit;
    }
    
    // Check if room ID already exists
    $stmt = $conn->prepare("SELECT id FROM rooms WHERE id = ?");
    $stmt->bind_param("s", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Room ID already exists']);
        exit;
    }
    
    // Insert new room
    $stmt = $conn->prepare("INSERT INTO rooms (id, name, description, fixed_passcode, reset_hours) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssi", $id, $name, $description, $fixed_passcode, $reset_hours);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Room created successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error creating room: ' . $stmt->error]);
    }
}

// Function to update an existing room
function updateRoom() {
    global $conn;
    
    // Get form data
    $id = secure_input($_POST['id'] ?? '');
    $name = secure_input($_POST['name'] ?? '');
    $description = secure_input($_POST['description'] ?? '');
    $fixed_passcode = secure_input($_POST['fixed_passcode'] ?? '');
    $reset_hours = intval($_POST['reset_hours'] ?? 2);
    
    // Validate input
    if (empty($id) || empty($name)) {
        echo json_encode(['success' => false, 'message' => 'Room ID and name are required']);
        exit;
    }
    
    // Update room
    $stmt = $conn->prepare("UPDATE rooms SET name = ?, description = ?, fixed_passcode = ?, reset_hours = ? WHERE id = ?");
    $stmt->bind_param("sssis", $name, $description, $fixed_passcode, $reset_hours, $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Room updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error updating room: ' . $stmt->error]);
    }
}

// Function to delete a room
function deleteRoom() {
    global $conn;
    
    // Get room ID
    $id = secure_input($_POST['id'] ?? '');
    
    // Validate input
    if (empty($id)) {
        echo json_encode(['success' => false, 'message' => 'Room ID is required']);
        exit;
    }
    
    // Check if room has active bookings
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM bookings WHERE room_id = ? AND status = 'active'");
    $stmt->bind_param("s", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    
    if ($row['count'] > 0) {
        echo json_encode(['success' => false, 'message' => 'Cannot delete room with active bookings']);
        exit;
    }
    
    // Delete room
    $stmt = $conn->prepare("DELETE FROM rooms WHERE id = ?");
    $stmt->bind_param("s", $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Room deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error deleting room: ' . $stmt->error]);
    }
}

// Close connection
$conn->close();
?>
