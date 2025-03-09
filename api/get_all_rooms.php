
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

// Handle GET request for all room details
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Prepare SQL statement to get all room information
    $stmt = $conn->prepare("SELECT id, name, description, fixed_passcode, reset_hours FROM rooms ORDER BY name ASC");
    $stmt->execute();
    $result = $stmt->get_result();
    
    $rooms = [];
    while ($row = $result->fetch_assoc()) {
        $rooms[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'description' => $row['description'],
            'fixed_passcode' => $row['fixed_passcode'],
            'reset_hours' => $row['reset_hours']
        ];
    }
    
    // Calculate some statistics for display
    $total_rooms = count($rooms);
    $fixed_passcode_count = 0;
    
    foreach ($rooms as $room) {
        if (!empty($room['fixed_passcode'])) {
            $fixed_passcode_count++;
        }
    }
    
    // Query for active bookings count
    $active_bookings_query = "SELECT COUNT(*) as count FROM bookings WHERE CURRENT_TIMESTAMP BETWEEN arrival_date AND departure_date";
    $active_result = $conn->query($active_bookings_query);
    $active_bookings = 0;
    
    if ($active_result) {
        $active_row = $active_result->fetch_assoc();
        $active_bookings = $active_row['count'];
    }
    
    // Return rooms and stats as JSON
    echo json_encode([
        'success' => true,
        'rooms' => $rooms,
        'stats' => [
            'total_rooms' => $total_rooms,
            'fixed_passcode_count' => $fixed_passcode_count,
            'active_bookings' => $active_bookings
        ]
    ]);
} else {
    // Return error for non-GET requests
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}

// Close database connection
$conn->close();
?>
