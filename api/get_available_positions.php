
<?php
// Start session
session_start();

// Include database configuration
require_once 'db_config.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'User not authenticated'
    ]);
    exit;
}

// Get entry point ID from query string
$entry_point_id = isset($_GET['entry_point_id']) ? secure_input($_GET['entry_point_id']) : '';

// Validate input
if (empty($entry_point_id)) {
    echo json_encode([
        'success' => false,
        'message' => 'Entry point ID is required'
    ]);
    exit;
}

try {
    // Check if entry point exists
    $stmt = $conn->prepare("SELECT id FROM entry_points WHERE id = ?");
    $stmt->bind_param("s", $entry_point_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Entry point not found'
        ]);
        exit;
    }
    
    // Get used positions for this entry point
    $stmt = $conn->prepare("SELECT position FROM entry_point_pins WHERE entry_point_id = ?");
    $stmt->bind_param("s", $entry_point_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $used_positions = [];
    while ($row = $result->fetch_assoc()) {
        $used_positions[] = $row['position'];
    }
    
    // Generate list of available positions (1-64)
    $available_positions = [];
    for ($i = 1; $i <= 64; $i++) {
        if (!in_array($i, $used_positions)) {
            $available_positions[] = $i;
        }
    }
    
    // Return success response
    echo json_encode([
        'success' => true,
        'available_positions' => $available_positions,
        'used_positions' => $used_positions
    ]);
} catch (Exception $e) {
    // Return error response
    echo json_encode([
        'success' => false,
        'message' => 'Error retrieving available positions: ' . $e->getMessage()
    ]);
}

// Close connection
$conn->close();
?>
