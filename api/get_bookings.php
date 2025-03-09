
<?php
// Include database configuration
require_once 'db_config.php';

// Start session
session_start();

// Set content type to JSON
header('Content-Type: application/json');

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) && !($_SERVER['HTTP_HOST'] == 'localhost' || $_SERVER['HTTP_HOST'] == '127.0.0.1')) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access'
    ]);
    exit;
}

// Helper function to sanitize input
function secure_input($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

// Handle get bookings request
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Add debug information
    error_log("get_bookings.php called - retrieving bookings");
    
    try {
        // Get date from query string
        $date = isset($_GET['date']) ? secure_input($_GET['date']) : date('Y-m-d');
        $room_id = isset($_GET['room']) ? secure_input($_GET['room']) : null;
        
        // Base SQL query
        $sql = "SELECT b.id, r.name as room_name, b.room_id, b.guest_name, b.email, b.phone, 
                 b.arrival_datetime, b.departure_datetime, b.access_code, b.status, b.created_at 
                 FROM bookings b
                 JOIN rooms r ON b.room_id = r.id
                 WHERE DATE(b.arrival_datetime) = ?";
        
        // Add room filter if specified
        $params = [$date];
        $types = "s";
        
        if ($room_id && $room_id != 'all') {
            $sql .= " AND b.room_id = ?";
            $params[] = $room_id;
            $types .= "s";
        }
        
        // Add order by
        $sql .= " ORDER BY b.arrival_datetime ASC";
        
        error_log("SQL Query: " . $sql);
        error_log("Query params: date=" . $date . ", room_id=" . ($room_id ?: "all"));
        
        // Prepare and execute statement
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $bookings = [];
        while ($row = $result->fetch_assoc()) {
            $bookings[] = [
                'id' => $row['id'],
                'room' => $row['room_name'],
                'roomId' => $row['room_id'],
                'guestName' => $row['guest_name'],
                'email' => $row['email'],
                'phone' => $row['phone'],
                'arrivalDateTime' => $row['arrival_datetime'],
                'departureDateTime' => $row['departure_datetime'],
                'accessCode' => $row['access_code'],
                'status' => $row['status'],
                'createdAt' => $row['created_at']
            ];
        }
        
        // If in demo mode (localhost) and no bookings found, add some sample bookings
        if (($_SERVER['HTTP_HOST'] == 'localhost' || $_SERVER['HTTP_HOST'] == '127.0.0.1') && count($bookings) === 0) {
            // Get rooms for demo bookings
            $rooms_stmt = $conn->prepare("SELECT id, name FROM rooms LIMIT 3");
            $rooms_stmt->execute();
            $rooms_result = $rooms_stmt->get_result();
            $demo_rooms = [];
            
            while ($room = $rooms_result->fetch_assoc()) {
                $demo_rooms[] = $room;
            }
            
            // If no rooms in database, use demo room IDs
            if (count($demo_rooms) === 0) {
                $demo_rooms = [
                    ['id' => 'demo1', 'name' => 'Demo Single Room'],
                    ['id' => 'demo2', 'name' => 'Demo Double Room'],
                    ['id' => 'demo3', 'name' => 'Demo Suite']
                ];
            }
            
            // Create sample bookings for today
            $current_hour = date('H');
            $bookings = [
                [
                    'id' => 'demo1',
                    'room' => $demo_rooms[0]['name'],
                    'roomId' => $demo_rooms[0]['id'],
                    'guestName' => 'John Smith',
                    'email' => 'john@example.com',
                    'phone' => '555-123-4567',
                    'arrivalDateTime' => date('Y-m-d') . ' ' . ($current_hour + 1) . ':00:00',
                    'departureDateTime' => date('Y-m-d', strtotime('+1 day')) . ' 12:00:00',
                    'accessCode' => '123456',
                    'status' => 'active',
                    'createdAt' => date('Y-m-d H:i:s')
                ],
                [
                    'id' => 'demo2',
                    'room' => $demo_rooms[1]['name'] ?? 'Demo Room 2',
                    'roomId' => $demo_rooms[1]['id'] ?? 'demo2',
                    'guestName' => 'Jane Doe',
                    'email' => 'jane@example.com',
                    'phone' => '555-987-6543',
                    'arrivalDateTime' => date('Y-m-d') . ' ' . ($current_hour + 2) . ':00:00',
                    'departureDateTime' => date('Y-m-d', strtotime('+2 days')) . ' 14:00:00',
                    'accessCode' => '654321',
                    'status' => 'active',
                    'createdAt' => date('Y-m-d H:i:s')
                ]
            ];
        }
        
        // Return bookings as JSON
        echo json_encode([
            'success' => true,
            'bookings' => $bookings,
            'date' => $date
        ]);
    } catch (Exception $e) {
        // Log the error
        error_log("Error in get_bookings.php: " . $e->getMessage());
        
        // Return error response
        echo json_encode([
            'success' => false,
            'message' => 'Error retrieving bookings: ' . $e->getMessage()
        ]);
    }
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
