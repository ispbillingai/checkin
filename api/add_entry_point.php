
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
        'message' => 'Entry Point ID and name are required'
    ]);
    exit;
}

// Sanitize input
$entry_point_id = secure_input($data['id']);
$entry_point_name = secure_input($data['name']);
$entry_point_description = isset($data['description']) ? secure_input($data['description']) : '';

try {
    // Check if entry point ID already exists
    $check_query = "SELECT id FROM entry_points WHERE id = ?";
    $check_stmt = $conn->prepare($check_query);
    $check_stmt->bind_param("s", $entry_point_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'An entry point with this ID already exists'
        ]);
        exit;
    }
    
    // Insert new entry point
    $query = "INSERT INTO entry_points (id, name, description) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sss", $entry_point_id, $entry_point_name, $entry_point_description);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Entry Point added successfully'
        ]);
    } else {
        throw new Exception("Error adding entry point: " . $conn->error);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
