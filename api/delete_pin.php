
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

// Check if this is a POST request
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
    exit;
}

// Get post parameters
$pin_id = isset($_POST['pin_id']) ? intval($_POST['pin_id']) : 0;

// Validate inputs
if ($pin_id <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing or invalid PIN ID'
    ]);
    exit;
}

try {
    // Check if PIN exists
    $stmt = $conn->prepare("SELECT id FROM entry_point_pins WHERE id = ?");
    $stmt->bind_param("i", $pin_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'PIN not found'
        ]);
        exit;
    }
    
    // Delete the PIN
    $stmt = $conn->prepare("DELETE FROM entry_point_pins WHERE id = ?");
    $stmt->bind_param("i", $pin_id);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'PIN deleted successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error deleting PIN: ' . $stmt->error
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

// Close connection
$conn->close();
?>
