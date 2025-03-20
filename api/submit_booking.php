
<?php
// Include database configuration
require_once '../php/db_config.php';

// Set the response header to JSON
header('Content-Type: application/json');

// Function to validate and process booking submission
function process_booking() {
    global $conn;
    
    // Check if the request method is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        return [
            'success' => false,
            'message' => 'Invalid request method. Only POST is allowed.'
        ];
    }
    
    // Validate required fields
    $required_fields = ['name', 'email', 'room', 'pin_code', 
                        'arrival_date', 'arrival_time', 'departure_date', 'departure_time'];
    
    foreach ($required_fields as $field) {
        if (!isset($_POST[$field]) || empty($_POST[$field])) {
            return [
                'success' => false,
                'message' => "Missing required field: {$field}"
            ];
        }
    }
    
    // Check if at least one entry point is selected
    if (!isset($_POST['entry_points']) || !is_array($_POST['entry_points']) || count($_POST['entry_points']) === 0) {
        return [
            'success' => false,
            'message' => 'At least one entry point must be selected'
        ];
    }
    
    // Secure input data
    $guest_name = secure_input($_POST['name']);
    $email = secure_input($_POST['email']);
    $phone = isset($_POST['phone']) ? secure_input($_POST['phone']) : '';
    $room_id = secure_input($_POST['room']);
    $pin_code = secure_input($_POST['pin_code']);
    $notes = isset($_POST['notes']) ? secure_input($_POST['notes']) : '';
    
    // Format datetime
    $arrival_datetime = $_POST['arrival_date'] . ' ' . $_POST['arrival_time'] . ':00';
    $departure_datetime = $_POST['departure_date'] . ' ' . $_POST['departure_time'] . ':00';
    
    // Get entry points data from positions
    $entry_points = [];
    foreach ($_POST['entry_points'] as $entry_id) {
        if (isset($_POST['positions'][$entry_id]) && !empty($_POST['positions'][$entry_id])) {
            $position = (int)$_POST['positions'][$entry_id];
            // Validate position
            if ($position < 1 || $position > 64) {
                return [
                    'success' => false,
                    'message' => 'Entry point position must be between 1 and 64'
                ];
            }
            $entry_points[] = [
                'id' => $entry_id,
                'position' => $position
            ];
        }
    }
    
    if (empty($entry_points)) {
        return [
            'success' => false,
            'message' => 'No valid entry points with positions provided'
        ];
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Check if the room exists
        $stmt = $conn->prepare("SELECT id, name FROM rooms WHERE id = ?");
        $stmt->bind_param("s", $room_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception("Selected room does not exist");
        }
        
        $room = $result->fetch_assoc();
        
        // Insert booking record
        $stmt = $conn->prepare("INSERT INTO bookings (room_id, guest_name, email, phone, arrival_datetime, departure_datetime, access_code, status) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, 'active')");
        $stmt->bind_param("sssssss", $room_id, $guest_name, $email, $phone, $arrival_datetime, $departure_datetime, $pin_code);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to create booking: " . $conn->error);
        }
        
        $booking_id = $conn->insert_id;
        
        // Process entry points
        foreach ($entry_points as $entry_point) {
            $entry_id = $entry_point['id'];
            $position = $entry_point['position'];
            
            // Assign PIN to entry point at the specified position
            $stmt = $conn->prepare("INSERT INTO entry_point_pins (entry_point_id, position, pin_code, booking_id) 
                                   VALUES (?, ?, ?, ?)");
            $stmt->bind_param("sisi", $entry_id, $position, $pin_code, $booking_id);
            
            if (!$stmt->execute()) {
                throw new Exception("Failed to assign PIN to entry point: " . $conn->error);
            }
        }
        
        // Commit transaction
        $conn->commit();
        
        return [
            'success' => true,
            'message' => 'Booking created successfully!',
            'booking_id' => $booking_id,
            'room_name' => $room['name'],
            'pin_code' => $pin_code
        ];
        
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}

// Process the booking and output the result
$result = process_booking();
echo json_encode($result);
?>
