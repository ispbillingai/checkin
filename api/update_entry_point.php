
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
    // Check if entry point exists
    $check_query = "SELECT id FROM entry_points WHERE id = ?";
    $check_stmt = $conn->prepare($check_query);
    $check_stmt->bind_param("s", $entry_point_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Entry Point not found'
        ]);
        exit;
    }
    
    // Update entry point
    $query = "UPDATE entry_points SET name = ?, description = ? WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sss", $entry_point_name, $entry_point_description, $entry_point_id);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Entry Point updated successfully'
        ]);
    } else {
        throw new Exception("Error updating entry point: " . $conn->error);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
