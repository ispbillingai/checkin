
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
    // Get current date and time
    $now = date('Y-m-d H:i:s');

    // Prepare SQL statement to get active bookings
    $sql = "SELECT 
                b.id, 
                b.guest_name, 
                b.access_code, 
                r.name as room_name,
                b.arrival_datetime,
                b.departure_datetime
            FROM 
                bookings b
            JOIN 
                rooms r ON b.room_id = r.id
            WHERE 
                b.departure_datetime >= ?
            ORDER BY 
                b.arrival_datetime DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $now);

    // Execute the query
    $stmt->execute();
    $result = $stmt->get_result();
    $bookings = [];

    // Fetch all active bookings
    while ($row = $result->fetch_assoc()) {
        $bookings[] = $row;
    }

    // Return success response
    echo json_encode([
        'success' => true,
        'bookings' => $bookings
    ]);
} catch (Exception $e) {
    // Return error response
    echo json_encode([
        'success' => false,
        'message' => 'Error retrieving active bookings: ' . $e->getMessage()
    ]);
}

// Close connection
$conn->close();
?>
