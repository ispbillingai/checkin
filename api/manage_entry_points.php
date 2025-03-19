
<?php
// Start session
session_start();

// Include database configuration
require_once 'db_config.php';

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['is_admin']) || $_SESSION['is_admin'] != 1) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access'
    ]);
    exit;
}

// Handle POST requests for create, update, delete operations
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $action = isset($_POST['action']) ? secure_input($_POST['action']) : '';
    
    if ($action == 'create') {
        // Create new entry point
        $id = isset($_POST['id']) ? secure_input($_POST['id']) : '';
        $name = isset($_POST['name']) ? secure_input($_POST['name']) : '';
        $description = isset($_POST['description']) ? secure_input($_POST['description']) : '';
        $connectedRooms = isset($_POST['connected_rooms']) ? json_decode($_POST['connected_rooms'], true) : [];
        
        // Validate input
        if (empty($id) || empty($name)) {
            echo json_encode([
                'success' => false,
                'message' => 'ID and Name are required'
            ]);
            exit;
        }
        
        // Check if ID already exists
        $stmt = $conn->prepare("SELECT id FROM entry_points WHERE id = ?");
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Entry point ID already exists'
            ]);
            exit;
        }
        
        // Insert new entry point
        $stmt = $conn->prepare("INSERT INTO entry_points (id, name, description) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $id, $name, $description);
        
        if ($stmt->execute()) {
            // If connected rooms were specified, create the mappings
            if (!empty($connectedRooms)) {
                foreach ($connectedRooms as $roomId) {
                    $stmt = $conn->prepare("INSERT INTO room_entry_points (room_id, entry_point_id) VALUES (?, ?)");
                    $stmt->bind_param("ss", $roomId, $id);
                    $stmt->execute();
                }
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Entry point created successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Error creating entry point: ' . $stmt->error
            ]);
        }
    } else if ($action == 'update') {
        // Update existing entry point
        $id = isset($_POST['id']) ? secure_input($_POST['id']) : '';
        $name = isset($_POST['name']) ? secure_input($_POST['name']) : '';
        $description = isset($_POST['description']) ? secure_input($_POST['description']) : '';
        $connectedRooms = isset($_POST['connected_rooms']) ? json_decode($_POST['connected_rooms'], true) : [];
        
        // Validate input
        if (empty($id) || empty($name)) {
            echo json_encode([
                'success' => false,
                'message' => 'ID and Name are required'
            ]);
            exit;
        }
        
        // Update entry point
        $stmt = $conn->prepare("UPDATE entry_points SET name = ?, description = ? WHERE id = ?");
        $stmt->bind_param("sss", $name, $description, $id);
        
        if ($stmt->execute()) {
            // Delete existing room mappings
            $stmt = $conn->prepare("DELETE FROM room_entry_points WHERE entry_point_id = ?");
            $stmt->bind_param("s", $id);
            $stmt->execute();
            
            // Create new room mappings
            if (!empty($connectedRooms)) {
                foreach ($connectedRooms as $roomId) {
                    $stmt = $conn->prepare("INSERT INTO room_entry_points (room_id, entry_point_id) VALUES (?, ?)");
                    $stmt->bind_param("ss", $roomId, $id);
                    $stmt->execute();
                }
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Entry point updated successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Error updating entry point: ' . $stmt->error
            ]);
        }
    } else if ($action == 'delete') {
        // Delete entry point
        $id = isset($_POST['id']) ? secure_input($_POST['id']) : '';
        
        if (empty($id)) {
            echo json_encode([
                'success' => false,
                'message' => 'Entry point ID is required'
            ]);
            exit;
        }
        
        // Check if entry point is being used in bookings
        $stmt = $conn->prepare("SELECT id FROM bookings WHERE entry_point_id = ? LIMIT 1");
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Cannot delete entry point that is being used in bookings'
            ]);
            exit;
        }
        
        // Delete entry point and its mappings
        $conn->begin_transaction();
        
        try {
            // Delete room mappings first (due to foreign key constraint)
            $stmt = $conn->prepare("DELETE FROM room_entry_points WHERE entry_point_id = ?");
            $stmt->bind_param("s", $id);
            $stmt->execute();
            
            // Then delete the entry point
            $stmt = $conn->prepare("DELETE FROM entry_points WHERE id = ?");
            $stmt->bind_param("s", $id);
            $stmt->execute();
            
            $conn->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Entry point deleted successfully'
            ]);
        } catch (Exception $e) {
            $conn->rollback();
            
            echo json_encode([
                'success' => false,
                'message' => 'Error deleting entry point: ' . $e->getMessage()
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid action'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}

// Close connection
$conn->close();
?>
