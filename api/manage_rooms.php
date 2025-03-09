
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

// Handle POST request for room management
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get operation mode (create, update, delete)
    $mode = isset($_POST['mode']) ? $_POST['mode'] : '';
    
    // Validate mode
    if (!in_array($mode, ['create', 'update', 'delete'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid operation mode'
        ]);
        exit;
    }
    
    if ($mode == 'create') {
        // Create new room
        // Validate required fields
        if (!isset($_POST['roomIdInput']) || !isset($_POST['roomName'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Room ID and Name are required'
            ]);
            exit;
        }
        
        $room_id = trim($_POST['roomIdInput']);
        $room_name = trim($_POST['roomName']);
        $description = isset($_POST['roomDescription']) ? trim($_POST['roomDescription']) : '';
        $fixed_passcode = isset($_POST['fixedPasscode']) ? trim($_POST['fixedPasscode']) : '';
        $reset_hours = isset($_POST['resetHours']) ? intval($_POST['resetHours']) : 2;
        
        // Validate room ID format (alphanumeric only)
        if (!preg_match('/^[a-zA-Z0-9_-]+$/', $room_id)) {
            echo json_encode([
                'success' => false,
                'message' => 'Room ID must contain only letters, numbers, underscores and hyphens'
            ]);
            exit;
        }
        
        // Check if room ID already exists
        $check_stmt = $conn->prepare("SELECT id FROM rooms WHERE id = ?");
        $check_stmt->bind_param("s", $room_id);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if ($check_result->num_rows > 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Room ID already exists'
            ]);
            exit;
        }
        
        // Insert new room
        $stmt = $conn->prepare("INSERT INTO rooms (id, name, description, fixed_passcode, reset_hours) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssi", $room_id, $room_name, $description, $fixed_passcode, $reset_hours);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Room created successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create room: ' . $conn->error
            ]);
        }
        
    } elseif ($mode == 'update') {
        // Update existing room
        // Validate required fields
        if (!isset($_POST['id']) || !isset($_POST['roomName'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Room ID and Name are required'
            ]);
            exit;
        }
        
        $room_id = trim($_POST['id']);
        $room_name = trim($_POST['roomName']);
        $description = isset($_POST['roomDescription']) ? trim($_POST['roomDescription']) : '';
        $fixed_passcode = isset($_POST['fixedPasscode']) ? trim($_POST['fixedPasscode']) : '';
        $reset_hours = isset($_POST['resetHours']) ? intval($_POST['resetHours']) : 2;
        
        // Update room
        $stmt = $conn->prepare("UPDATE rooms SET name = ?, description = ?, fixed_passcode = ?, reset_hours = ? WHERE id = ?");
        $stmt->bind_param("sssis", $room_name, $description, $fixed_passcode, $reset_hours, $room_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Room updated successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update room: ' . $conn->error
            ]);
        }
        
    } elseif ($mode == 'delete') {
        // Delete room
        // Validate required fields
        if (!isset($_POST['id'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Room ID is required'
            ]);
            exit;
        }
        
        $room_id = trim($_POST['id']);
        
        // Check if room has any bookings
        $check_bookings = $conn->prepare("SELECT COUNT(*) as count FROM bookings WHERE room_id = ?");
        $check_bookings->bind_param("s", $room_id);
        $check_bookings->execute();
        $bookings_result = $check_bookings->get_result();
        $bookings_count = $bookings_result->fetch_assoc()['count'];
        
        if ($bookings_count > 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Cannot delete room with existing bookings. Delete bookings first.'
            ]);
            exit;
        }
        
        // Delete room
        $stmt = $conn->prepare("DELETE FROM rooms WHERE id = ?");
        $stmt->bind_param("s", $room_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Room deleted successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to delete room: ' . $conn->error
            ]);
        }
    }
} else {
    // Return error for non-POST requests
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}

// Close database connection
$conn->close();
?>
