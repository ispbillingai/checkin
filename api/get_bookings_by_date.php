
<?php
// Start session
session_start();

// Check if user is logged in and is an admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 'admin') {
    header('HTTP/1.1 403 Forbidden');
    echo json_encode(['success' => false, 'message' => 'Access denied']);
    exit;
}

// Include database configuration
require_once 'db_config.php';

// Get the date parameter from the request
$date = $_GET['date'] ?? date('Y-m-d');
$room = $_GET['room'] ?? 'all';

try {
    // Connect to database
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Prepare SQL statement
    $sql = "SELECT b.id, r.name as room_name, b.room_id, b.guest_name, b.email, b.phone, 
            b.arrival_datetime, b.departure_datetime, b.access_code, b.created_at
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            WHERE DATE(b.arrival_datetime) = :date";
    
    // Add room filter if specified
    if ($room !== 'all') {
        $sql .= " AND b.room_id = :room";
    }
    
    $sql .= " ORDER BY b.arrival_datetime ASC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':date', $date);
    
    if ($room !== 'all') {
        $stmt->bindParam(':room', $room);
    }
    
    // Execute statement
    $stmt->execute();
    
    // Fetch all bookings
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Return JSON response
    echo json_encode(['success' => true, 'data' => $bookings]);
    
} catch(PDOException $e) {
    // Return error response
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
