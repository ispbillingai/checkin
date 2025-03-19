
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

try {
    // Prepare SQL statement to get all entry points
    $sql = "SELECT id, name, description FROM entry_points ORDER BY name";
    $stmt = $conn->prepare($sql);

    // Execute the query
    $stmt->execute();
    $result = $stmt->get_result();
    $entry_points = [];

    // Fetch all entry points
    while ($row = $result->fetch_assoc()) {
        $entry_points[] = $row;
    }

    // Return success response
    echo json_encode([
        'success' => true,
        'entry_points' => $entry_points
    ]);
} catch (Exception $e) {
    // Return error response
    echo json_encode([
        'success' => false,
        'message' => 'Error retrieving entry points: ' . $e->getMessage()
    ]);
}

// Close connection
$conn->close();
?>
