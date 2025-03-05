
<?php
// Include database configuration
require_once 'db_config.php';

// Start session
session_start();

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access'
    ]);
    exit;
}

// Handle get bookings request
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Get date from query string
    $date = isset($_GET['date']) ? secure_input($_GET['date']) : date('Y-m-d');
    $room_id = isset($_GET['room']) ? secure_input($_GET['room']) : null;
    
    // Base SQL query
    $sql = "SELECT b.id, r.name as room_name, b.room_id, b.guest_name, b.email, b.phone, 
             b.arrival_date_time, b.departure_date_time, b.access_code, b.created_at 
             FROM bookings b
             JOIN rooms r ON b.room_id = r.id
             WHERE DATE(b.arrival_date_time) = ?";
    
    // Add room filter if specified
    $params = [$date];
    $types = "s";
    
    if ($room_id && $room_id != 'all') {
        $sql .= " AND b.room_id = ?";
        $params[] = $room_id;
        $types .= "s";
    }
    
    // Add order by
    $sql .= " ORDER BY b.arrival_date_time ASC";
    
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
            'arrivalDateTime' => $row['arrival_date_time'],
            'departureDateTime' => $row['departure_date_time'],
            'accessCode' => $row['access_code'],
            'createdAt' => $row['created_at']
        ];
    }
    
    // Return bookings as JSON
    echo json_encode([
        'success' => true,
        'bookings' => $bookings
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
