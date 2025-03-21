
<?php
// Include database configuration
require_once '../php/db_config.php';

// Set the response header to JSON
header('Content-Type: application/json');

// Get JSON data from request
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

if (!$data) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON data'
    ]);
    exit;
}

// Required fields
if (empty($data['id']) || empty($data['name'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Room ID and name are required'
    ]);
    exit;
}

// Sanitize input
$room_id = secure_input($data['id']);
$room_name = secure_input($data['name']);
$room_description = isset($data['description']) ? secure_input($data['description']) : '';
$room_ip_address = isset($data['ip_address']) ? secure_input($data['ip_address']) : null;

try {
    // Check if room ID already exists
    $check_query = "SELECT id FROM rooms WHERE id = ?";
    $check_stmt = $conn->prepare($check_query);
    $check_stmt->bind_param("s", $room_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'A room with this ID already exists'
        ]);
        exit;
    }
    
    // Insert new room
    $query = "INSERT INTO rooms (id, name, description, ip_address) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ssss", $room_id, $room_name, $room_description, $room_ip_address);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Room added successfully'
        ]);
    } else {
        throw new Exception("Error adding room: " . $conn->error);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
