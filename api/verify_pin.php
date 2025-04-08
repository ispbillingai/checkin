
<?php
// Include database configuration
require_once '../php/db_config.php';

// Set the response header to JSON
header('Content-Type: application/json');

// Function to verify PIN for an entry point
function verify_pin() {
    global $conn;
    
    // Check if the request method is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        return [
            'success' => false,
            'message' => 'Invalid request method. Only POST is allowed.'
        ];
    }
    
    // Get JSON input
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (!$data) {
        return [
            'success' => false,
            'message' => 'Invalid JSON data'
        ];
    }
    
    // Validate required fields
    if (!isset($data['entry_point_id']) || !isset($data['pin_code']) || !isset($data['position'])) {
        return [
            'success' => false,
            'message' => 'Missing required fields: entry_point_id, pin_code, and position are required'
        ];
    }
    
    $entry_point_id = secure_input($data['entry_point_id']);
    $pin_code = secure_input($data['pin_code']);
    $position = (int)$data['position'];
    
    // Validate position
    if ($position < 1 || $position > 64) {
        return [
            'success' => false,
            'message' => 'Position must be between 1 and 64'
        ];
    }
    
    try {
        // First, check if this is a staff PIN code
        $stmt = $conn->prepare("SELECT s.id, s.name, s.email 
                                FROM staff s 
                                WHERE s.pin_code = ? 
                                AND (s.access_all_rooms = 1 
                                    OR (s.entry_points LIKE CONCAT('%', ?, '%') 
                                        AND FIND_IN_SET(?, REPLACE(s.entry_point_positions, ' ', ''))))");
        $stmt->bind_param("ssi", $pin_code, $entry_point_id, $position);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // Staff access granted
            $staff = $result->fetch_assoc();
            
            // Log the successful staff access
            log_access_attempt($entry_point_id, 0, 'granted_staff');
            
            return [
                'success' => true,
                'message' => 'Staff access granted',
                'staff' => [
                    'id' => $staff['id'],
                    'name' => $staff['name'],
                    'email' => $staff['email']
                ]
            ];
        }
        
        // If not a staff PIN, check if it's a guest PIN
        $query = "SELECT ep.id, b.id as booking_id, b.guest_name, r.name as room_name, 
                         b.arrival_datetime, b.departure_datetime
                  FROM entry_point_pins ep
                  JOIN bookings b ON ep.booking_id = b.id
                  JOIN rooms r ON b.room_id = r.id
                  WHERE ep.entry_point_id = ? 
                    AND ep.position = ? 
                    AND ep.pin_code = ?
                    AND b.status = 'active'
                    AND NOW() BETWEEN b.arrival_datetime AND b.departure_datetime";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param("sis", $entry_point_id, $position, $pin_code);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            // Log the access attempt as denied
            log_access_attempt($entry_point_id, 0, 'denied');
            
            return [
                'success' => false,
                'message' => 'Invalid PIN or access not granted at this time'
            ];
        }
        
        $access = $result->fetch_assoc();
        
        // Log the successful access
        log_access_attempt($entry_point_id, $access['booking_id'], 'granted');
        
        return [
            'success' => true,
            'message' => 'Access granted',
            'booking' => [
                'guest_name' => $access['guest_name'],
                'room_name' => $access['room_name'],
                'arrival' => $access['arrival_datetime'],
                'departure' => $access['departure_datetime']
            ]
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}

// Function to log access attempts
function log_access_attempt($entry_point_id, $booking_id, $result) {
    global $conn;
    
    $ip_address = $_SERVER['REMOTE_ADDR'];
    $now = date('Y-m-d H:i:s');
    
    // Insert log record if access_logs table exists
    $check_table = $conn->query("SHOW TABLES LIKE 'access_logs'");
    
    if ($check_table->num_rows > 0) {
        $stmt = $conn->prepare("INSERT INTO access_logs (booking_id, entry_point_id, access_datetime, access_result, ip_address) 
                               VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("issss", $booking_id, $entry_point_id, $now, $result, $ip_address);
        $stmt->execute();
    }
}

// Process the PIN verification request and output the result
$result = verify_pin();
echo json_encode($result);
?>
