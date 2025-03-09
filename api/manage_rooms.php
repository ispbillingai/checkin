
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

// Set content type to JSON
header('Content-Type: application/json');

// Log POST data for debugging
error_log("manage_rooms.php - Request received");
error_log("POST data: " . json_encode($_POST));

// Handle POST request for room management
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get operation mode (create, update, delete) - check both mode and action fields
    $mode = isset($_POST['mode']) ? $_POST['mode'] : '';
    
    // If mode is empty, try to get it from 'action' parameter
    if (empty($mode) && isset($_POST['action'])) {
        $mode = $_POST['action'];
    }
    
    // Log request data for debugging
    error_log("manage_rooms.php - Request received with mode: " . $mode);
    error_log("POST data: " . json_encode($_POST));
    
    // Validate mode
    if (!in_array($mode, ['create', 'update', 'delete'])) {
        error_log("Invalid operation mode: " . $mode);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid operation mode'
        ]);
        exit;
    }
    
    if ($mode == 'create') {
        // Create new room
        // Validate required fields
        if ((!isset($_POST['roomIdInput']) && !isset($_POST['id'])) || (!isset($_POST['roomName']) && !isset($_POST['name']))) {
            echo json_encode([
                'success' => false,
                'message' => 'Room ID and Name are required'
            ]);
            exit;
        }
        
        // Get room ID from either roomIdInput or id field
        $room_id = isset($_POST['roomIdInput']) ? trim($_POST['roomIdInput']) : trim($_POST['id']);
        
        // Get other fields with fallbacks
        $room_name = isset($_POST['roomName']) ? trim($_POST['roomName']) : trim($_POST['name']);
        $description = isset($_POST['roomDescription']) ? trim($_POST['roomDescription']) : 
                      (isset($_POST['description']) ? trim($_POST['description']) : '');
        $fixed_passcode = isset($_POST['fixedPasscode']) ? trim($_POST['fixedPasscode']) : 
                         (isset($_POST['fixed_passcode']) ? trim($_POST['fixed_passcode']) : '');
        $reset_hours = isset($_POST['resetHours']) ? intval($_POST['resetHours']) : 
                      (isset($_POST['reset_hours']) ? intval($_POST['reset_hours']) : 2);
        
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
        if (!isset($_POST['id']) || (!isset($_POST['roomName']) && !isset($_POST['name']))) {
            error_log("Update room failed: Room ID or Name missing");
            echo json_encode([
                'success' => false,
                'message' => 'Room ID and Name are required'
            ]);
            exit;
        }
        
        $room_id = trim($_POST['id']);
        $room_name = isset($_POST['roomName']) ? trim($_POST['roomName']) : trim($_POST['name']);
        $description = isset($_POST['roomDescription']) ? trim($_POST['roomDescription']) : 
                      (isset($_POST['description']) ? trim($_POST['description']) : '');
        $fixed_passcode = isset($_POST['fixedPasscode']) ? trim($_POST['fixedPasscode']) : 
                         (isset($_POST['fixed_passcode']) ? trim($_POST['fixed_passcode']) : '');
        $reset_hours = isset($_POST['resetHours']) ? intval($_POST['resetHours']) : 
                      (isset($_POST['reset_hours']) ? intval($_POST['reset_hours']) : 2);
        
        error_log("Updating room with ID: " . $room_id);
        error_log("Room data: " . json_encode([
            'name' => $room_name,
            'description' => $description,
            'fixed_passcode' => $fixed_passcode,
            'reset_hours' => $reset_hours
        ]));
        
        // Update room
        $stmt = $conn->prepare("UPDATE rooms SET name = ?, description = ?, fixed_passcode = ?, reset_hours = ? WHERE id = ?");
        $stmt->bind_param("sssis", $room_name, $description, $fixed_passcode, $reset_hours, $room_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Room updated successfully'
            ]);
        } else {
            error_log("Room update failed: " . $conn->error);
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
