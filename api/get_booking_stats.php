
<?php
// Include database configuration
require_once '../php/db_config.php';

// Set response headers
header('Content-Type: application/json');

// Simple auth check (in a real app, verify JWT token)
$headers = getallheaders();
if (!isset($headers['Authorization']) || strpos($headers['Authorization'], 'Bearer ') !== 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Authentication required'
    ]);
    exit;
}

try {
    // Get total bookings count
    $total_query = "SELECT COUNT(*) as count FROM bookings";
    $total_result = $conn->query($total_query);
    $total_bookings = $total_result->fetch_assoc()['count'];
    
    // Get active bookings count
    $active_query = "SELECT COUNT(*) as count FROM bookings WHERE status = 'active'";
    $active_result = $conn->query($active_query);
    $active_bookings = $active_result->fetch_assoc()['count'];
    
    // Get count of distinct rooms with active bookings
    $rooms_query = "SELECT COUNT(DISTINCT room_id) as count FROM bookings WHERE status = 'active'";
    $rooms_result = $conn->query($rooms_query);
    $rooms_booked = $rooms_result->fetch_assoc()['count'];
    
    echo json_encode([
        'success' => true,
        'total_bookings' => $total_bookings,
        'active_bookings' => $active_bookings,
        'rooms_booked' => $rooms_booked
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
