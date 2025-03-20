<?php
// Include database configuration
require_once '../php/db_config.php';

// Set the response header to JSON
header('Content-Type: application/json');

/**
 * Safely trim/escape user input
 */
function secure_input($data) {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

/**
 * Process booking submission and insert into the `bookings` table only.
 */
function process_booking() {
    global $conn;
    
    // Ensure this is a POST request
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        return [
            'success' => false,
            'message' => 'Invalid request method. Only POST is allowed.'
        ];
    }
    
    // Validate required fields
    $required_fields = ['name','email','room','pin_code','arrival_date','arrival_time','departure_date','departure_time'];
    foreach ($required_fields as $field) {
        if (empty($_POST[$field])) {
            return [
                'success' => false,
                'message' => "Missing required field: {$field}"
            ];
        }
    }

    // At least one entry point must be selected
    if (!isset($_POST['entry_points']) || !is_array($_POST['entry_points']) || count($_POST['entry_points']) === 0) {
        return [
            'success' => false,
            'message' => 'At least one entry point must be selected'
        ];
    }
    
    // Gather data
    $guest_name  = secure_input($_POST['name']);
    $email       = secure_input($_POST['email']);
    $phone       = !empty($_POST['phone']) ? secure_input($_POST['phone']) : '';
    $room_id     = secure_input($_POST['room']);
    $pin_code    = secure_input($_POST['pin_code']);
    $notes       = !empty($_POST['notes']) ? secure_input($_POST['notes']) : '';

    // Format arrival & departure datetime
    $arrival_datetime   = $_POST['arrival_date'] . ' ' . $_POST['arrival_time'] . ':00';
    $departure_datetime = $_POST['departure_date'] . ' ' . $_POST['departure_time'] . ':00';
    
    // Build arrays of entry points & positions
    $entry_ids      = [];
    $entry_positions = [];
    
    foreach ($_POST['entry_points'] as $entry_id) {
        // Make sure position is provided
        if (!isset($_POST['positions'][$entry_id]) || empty($_POST['positions'][$entry_id])) {
            return [
                'success' => false,
                'message' => "Position is required for entry point ID {$entry_id}"
            ];
        }
        $position = (int)$_POST['positions'][$entry_id];
        if ($position < 1 || $position > 64) {
            return [
                'success' => false,
                'message' => 'Entry point position must be between 1 and 64'
            ];
        }
        $entry_ids[]        = $entry_id;
        $entry_positions[]  = $position;
    }
    
    // Convert arrays to comma-separated strings
    // Example: $entry_ids => [1,2,5] => "1,2,5"
    $entry_ids_str       = implode(',', $entry_ids);
    $positions_str       = implode(',', $entry_positions);

    // Start transaction
    $conn->begin_transaction();
    
    try {
        // (Optional) Validate the room if needed
        // If your "rooms" table has an id = "A101" or "101", etc., do:
        $stmt = $conn->prepare("SELECT id, name FROM rooms WHERE id = ?");
        $stmt->bind_param("s", $room_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            throw new Exception("Selected room does not exist");
        }
        $room = $result->fetch_assoc();
        
        // Insert booking record (everything goes into `bookings`)
        $sql = "
            INSERT INTO bookings
                (room_id, entry_point_id, positions, guest_name, email, phone,
                 arrival_datetime, departure_datetime, access_code, notes, status)
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
        ";
        $stmt = $conn->prepare($sql);
        // Note the param order below matches the placeholders
        $stmt->bind_param(
            "ssssssssss",
            $room_id,
            $entry_ids_str,
            $positions_str,
            $guest_name,
            $email,
            $phone,
            $arrival_datetime,
            $departure_datetime,
            $pin_code,
            $notes
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to create booking: " . $conn->error);
        }
        
        $booking_id = $conn->insert_id;
        
        // Commit
        $conn->commit();
        
        return [
            'success'     => true,
            'message'     => 'Booking created successfully!',
            'booking_id'  => $booking_id,
            'room_name'   => $room['name'],
            'pin_code'    => $pin_code
        ];
        
    } catch (Exception $e) {
        $conn->rollback();
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}

// Actually process the booking
$result = process_booking();
echo json_encode($result);
?>
