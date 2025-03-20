
<?php
// Start session
session_start();

// Include database configuration
require_once 'db_config.php';

// Check if this is an admin authentication check (no URL parameters)
if (!isset($_GET['room']) && !isset($_GET['entry']) && !isset($_GET['code'])) {
    // Check if user is logged in and is admin
    $isLoggedIn = isset($_SESSION['user_id']);
    $isAdmin = isset($_SESSION['is_admin']) && $_SESSION['is_admin'] == 1;
    
    // Return authentication status
    echo json_encode([
        'success' => $isLoggedIn && $isAdmin,
        'isAdmin' => $isAdmin,
        'message' => $isLoggedIn ? ($isAdmin ? 'Authenticated as admin' : 'Not an admin user') : 'Not authenticated'
    ]);
    exit;
}

// Handle room access verification (original functionality)
if ($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET['entry']) && isset($_GET['code'])) {
    // Get and log parameters
    $entry_point_id = isset($_GET['entry']) ? secure_input($_GET['entry']) : '';
    $code = isset($_GET['code']) ? secure_input($_GET['code']) : '';
    $position = isset($_GET['position']) ? intval($_GET['position']) : null;
    
    if (empty($entry_point_id) || empty($code)) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing parameters'
        ]);
        exit;
    }
    
    try {
        // Get current datetime
        $now = date('Y-m-d H:i:s');
        
        // First, check if there's a direct match in the entry_point_pins table
        if ($position !== null) {
            // If position is specified, check that specific position
            $stmt = $conn->prepare("
                SELECT ep.pin_code, b.*, r.name as room_name, e.name as entry_name 
                FROM entry_point_pins ep
                JOIN bookings b ON ep.booking_id = b.id
                JOIN rooms r ON b.room_id = r.id
                JOIN entry_points e ON ep.entry_point_id = e.id
                WHERE ep.entry_point_id = ? 
                AND ep.position = ?
                AND ep.pin_code = ?
                AND b.arrival_date_time <= ? 
                AND b.departure_date_time >= ?
            ");
            $stmt->bind_param("sisss", $entry_point_id, $position, $code, $now, $now);
        } else {
            // If position is not specified, check all positions
            $stmt = $conn->prepare("
                SELECT ep.pin_code, b.*, r.name as room_name, e.name as entry_name 
                FROM entry_point_pins ep
                JOIN bookings b ON ep.booking_id = b.id
                JOIN rooms r ON b.room_id = r.id
                JOIN entry_points e ON ep.entry_point_id = e.id
                WHERE ep.entry_point_id = ? 
                AND ep.pin_code = ?
                AND b.arrival_date_time <= ? 
                AND b.departure_date_time >= ?
            ");
            $stmt->bind_param("ssss", $entry_point_id, $code, $now, $now);
        }
        
        if (!$stmt) {
            throw new Exception("Database prepare failed");
        }
        
        if (!$stmt->execute()) {
            throw new Exception("Database execute failed");
        }
        
        $result = $stmt->get_result();
        
        // If no results found with the pin check, fallback to the original booking check
        if ($result->num_rows === 0) {
            // Prepare the original SQL statement
            $stmt = $conn->prepare("SELECT b.*, r.name as room_name, e.name as entry_name 
                                   FROM bookings b 
                                   JOIN rooms r ON b.room_id = r.id 
                                   JOIN entry_points e ON b.entry_point_id = e.id 
                                   WHERE b.entry_point_id = ? AND b.access_code = ? 
                                   AND b.arrival_date_time <= ? AND b.departure_date_time >= ?");
            
            if (!$stmt) {
                throw new Exception("Database prepare failed");
            }
            
            $stmt->bind_param("ssss", $entry_point_id, $code, $now, $now);
            
            if (!$stmt->execute()) {
                throw new Exception("Database execute failed");
            }
            
            $result = $stmt->get_result();
        }
        
        if ($result->num_rows > 0) {
            $booking = $result->fetch_assoc();
            
            // Log the successful access
            $access_log_stmt = $conn->prepare("INSERT INTO access_logs (booking_id, entry_point_id, access_datetime, access_result, ip_address) 
                                              VALUES (?, ?, ?, 'granted', ?)");
            $ip_address = $_SERVER['REMOTE_ADDR'];
            $access_log_stmt->bind_param("isss", $booking['id'], $entry_point_id, $now, $ip_address);
            $access_log_stmt->execute();
            
            echo json_encode([
                'success' => true,
                'message' => 'Access granted',
                'booking' => [
                    'guestName' => $booking['guest_name'],
                    'roomName' => $booking['room_name'],
                    'entryName' => $booking['entry_name'],
                    'arrivalDateTime' => $booking['arrival_date_time'],
                    'departureDateTime' => $booking['departure_date_time']
                ]
            ]);
        } else {
            // Log the failed access attempt
            $access_log_stmt = $conn->prepare("INSERT INTO access_logs (booking_id, entry_point_id, access_datetime, access_result, ip_address) 
                                              VALUES (0, ?, ?, 'denied', ?)");
            $ip_address = $_SERVER['REMOTE_ADDR'];
            $access_log_stmt->bind_param("sss", $entry_point_id, $now, $ip_address);
            $access_log_stmt->execute();
            
            echo json_encode([
                'success' => false,
                'message' => 'Access denied: Invalid code or expired booking'
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Server error occurred'
        ]);
    }
} else {
    // If we get here, it's not a room access check but also doesn't have the proper parameters
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request parameters'
    ]);
}

$conn->close();
?>
