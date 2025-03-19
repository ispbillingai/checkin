
<?php
// Start session
session_start();

// Include database configuration
require_once 'db_config.php';

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'User not authenticated'
    ]);
    exit;
}

// Get entry point ID from query string if provided
$entry_point_id = isset($_GET['entry_point_id']) ? secure_input($_GET['entry_point_id']) : null;

try {
    // Prepare SQL statement to get PIN assignments
    if ($entry_point_id && $entry_point_id != 'all') {
        $sql = "SELECT 
                    ep.id,
                    ep.entry_point_id,
                    ep.position,
                    ep.pin_code,
                    ep.booking_id,
                    e.name as entry_point_name,
                    b.guest_name,
                    r.name as room_name,
                    b.departure_datetime as valid_until
                FROM 
                    entry_point_pins ep
                JOIN 
                    entry_points e ON ep.entry_point_id = e.id
                JOIN 
                    bookings b ON ep.booking_id = b.id
                JOIN 
                    rooms r ON b.room_id = r.id
                WHERE 
                    ep.entry_point_id = ?
                ORDER BY 
                    e.name, ep.position";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $entry_point_id);
    } else {
        $sql = "SELECT 
                    ep.id,
                    ep.entry_point_id,
                    ep.position,
                    ep.pin_code,
                    ep.booking_id,
                    e.name as entry_point_name,
                    b.guest_name,
                    r.name as room_name,
                    b.departure_datetime as valid_until
                FROM 
                    entry_point_pins ep
                JOIN 
                    entry_points e ON ep.entry_point_id = e.id
                JOIN 
                    bookings b ON ep.booking_id = b.id
                JOIN 
                    rooms r ON b.room_id = r.id
                ORDER BY 
                    e.name, ep.position";

        $stmt = $conn->prepare($sql);
    }

    // Execute the query
    $stmt->execute();
    $result = $stmt->get_result();
    $pins = [];

    // Fetch all pins
    while ($row = $result->fetch_assoc()) {
        $pins[] = $row;
    }

    // Get available positions for the entry point if specified
    $available_positions = [];
    if ($entry_point_id && $entry_point_id != 'all') {
        $used_positions = [];
        foreach ($pins as $pin) {
            $used_positions[] = $pin['position'];
        }
        
        // Create array of available positions (1-64)
        for ($i = 1; $i <= 64; $i++) {
            if (!in_array($i, $used_positions)) {
                $available_positions[] = $i;
            }
        }
    }

    // Return success response
    echo json_encode([
        'success' => true,
        'pins' => $pins,
        'available_positions' => $available_positions
    ]);
} catch (Exception $e) {
    // Return error response
    echo json_encode([
        'success' => false,
        'message' => 'Error retrieving PIN assignments: ' . $e->getMessage()
    ]);
}

// Close connection
$conn->close();
?>
