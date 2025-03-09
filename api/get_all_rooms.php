
<?php
// Include database configuration
require_once 'db_config.php';

// Start session
session_start();

// Check if user is authenticated and is admin
if (!isset($_SESSION['user_id']) && !($_SERVER['HTTP_HOST'] == 'localhost' || $_SERVER['HTTP_HOST'] == '127.0.0.1')) {
    // Return error for unauthenticated users
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access'
    ]);
    exit;
}

// Handle GET request for all room details
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Add debug information
    error_log("get_all_rooms.php called - getting all rooms");
    
    // Set the content type to JSON
    header('Content-Type: application/json');
    
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
    
    // If on localhost with no rooms, provide demo data
    if (($_SERVER['HTTP_HOST'] == 'localhost' || $_SERVER['HTTP_HOST'] == '127.0.0.1') && count($rooms) === 0) {
        error_log("No rooms found in database, providing demo data");
        $rooms = [
            [
                'id' => 'demo1',
                'name' => 'Demo Single Room',
                'description' => 'A comfortable single room perfect for solo travelers.',
                'fixed_passcode' => '1234',
                'reset_hours' => 2
            ],
            [
                'id' => 'demo2',
                'name' => 'Demo Double Room',
                'description' => 'Spacious double room with king-size bed.',
                'fixed_passcode' => '',
                'reset_hours' => 3
            ],
            [
                'id' => 'demo3',
                'name' => 'Demo Suite',
                'description' => 'Luxury suite with separate living area and bedroom.',
                'fixed_passcode' => '5678',
                'reset_hours' => 4
            ]
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
    
    // If on localhost with no actual bookings, provide a demo count
    if (($_SERVER['HTTP_HOST'] == 'localhost' || $_SERVER['HTTP_HOST'] == '127.0.0.1') && $active_bookings === 0) {
        $active_bookings = 2; // Demo value
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
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}

// Close database connection
$conn->close();
?>
