
<?php
// Include database configuration
require_once '../php/db_config.php';

// Set the response header to JSON
header('Content-Type: application/json');

try {
    // Query to get all bookings with room information
    $query = "SELECT b.id, b.guest_name, b.email, r.name as room_name, 
                     b.arrival_datetime, b.departure_datetime, 
                     b.access_code, b.status, b.created_at
              FROM bookings b
              JOIN rooms r ON b.room_id = r.id
              ORDER BY b.created_at DESC";
    
    $result = $conn->query($query);
    
    $bookings = [];
    while ($row = $result->fetch_assoc()) {
        // Get entry points for this booking
        $entry_points_query = "SELECT DISTINCT e.id, e.name, ep.position
                              FROM entry_points e
                              JOIN entry_point_pins ep ON e.id = ep.entry_point_id
                              WHERE ep.booking_id = ?";
        
        $stmt = $conn->prepare($entry_points_query);
        $stmt->bind_param("i", $row['id']);
        $stmt->execute();
        $entry_points_result = $stmt->get_result();
        
        $entry_points = [];
        while ($ep = $entry_points_result->fetch_assoc()) {
            $entry_points[] = $ep;
        }
        
        $row['entry_points'] = $entry_points;
        $bookings[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'bookings' => $bookings
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
