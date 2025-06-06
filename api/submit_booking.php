
<?php
// Include database configuration, which already defines secure_input()
require_once '../php/db_config.php';

// Set the response header to JSON
header('Content-Type: application/json');

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
    $required_fields = [
        'name',
        'email',
        'room',
        'pin_code',
        'arrival_date',
        'arrival_time',
        'departure_date',
        'departure_time'
    ];
    foreach ($required_fields as $field) {
        if (empty($_POST[$field])) {
            return [
                'success' => false,
                'message' => "Missing required field: {$field}"
            ];
        }
    }

    // At least one entry point must be selected
    if (
        !isset($_POST['entry_points']) ||
        !is_array($_POST['entry_points']) ||
        count($_POST['entry_points']) === 0
    ) {
        return [
            'success' => false,
            'message' => 'At least one entry point must be selected'
        ];
    }
    
    // Gather data from POST
    $guest_name     = secure_input($_POST['name']);
    $email          = secure_input($_POST['email']);
    $phone          = !empty($_POST['phone']) ? secure_input($_POST['phone']) : '';
    $room_id        = secure_input($_POST['room']);
    $pin_code       = secure_input($_POST['pin_code']);
    $notes          = !empty($_POST['notes']) ? secure_input($_POST['notes']) : '';

    // Format arrival & departure datetime
    $arrival_datetime   = $_POST['arrival_date'] . ' ' . $_POST['arrival_time'] . ':00';
    $departure_datetime = $_POST['departure_date'] . ' ' . $_POST['departure_time'] . ':00';
    
    // Build arrays of entry points
    $entry_ids = [];
    
    foreach ($_POST['entry_points'] as $entry_id) {
        $entry_ids[] = $entry_id;
    }
    
    // Convert entry points array to comma-separated string
    $entry_ids_str = implode(',', $entry_ids);

    // Get room number for position assignment
    $room_number = null;
    if (preg_match('/room(\d+)/', $room_id, $matches)) {
        $room_number = (int)$matches[1];
    } else {
        // If room ID doesn't follow the pattern, use 1 as default
        $room_number = 1;
    }

    // Set room position to 1 (constant for all rooms)
    $room_position = 1;
    
    // Set entry point positions to the room number
    $entry_positions = array_fill(0, count($entry_ids), $room_number);
    $positions_str = implode(',', $entry_positions);

    // Start transaction
    $conn->begin_transaction();
    
    try {
        // Optional: validate that the selected room actually exists
        $stmt = $conn->prepare("SELECT id, name FROM rooms WHERE id = ?");
        $stmt->bind_param("s", $room_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            throw new Exception("Selected room does not exist");
        }
        $room = $result->fetch_assoc();
        
        // Insert booking record
        // Include `room_position` in the INSERT
        $sql = "
            INSERT INTO bookings
                (room_id, entry_point_id, positions, guest_name, email, phone,
                 arrival_datetime, departure_datetime, access_code, notes, status, room_position)
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
        ";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "ssssssssssi",
            $room_id,
            $entry_ids_str,
            $positions_str,
            $guest_name,
            $email,
            $phone,
            $arrival_datetime,
            $departure_datetime,
            $pin_code,
            $notes,
            $room_position
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to create booking: " . $conn->error);
        }
        
        $booking_id = $conn->insert_id;
        
        // Commit
        $conn->commit();
        
        return [
            'success'    => true,
            'message'    => 'Booking created successfully!',
            'booking_id' => $booking_id,
            'room_name'  => $room['name'],
            'pin_code'   => $pin_code
        ];
        
    } catch (Exception $e) {
        // Roll back on any error
        $conn->rollback();
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}

// Actually process the booking and output the result
$result = process_booking();
echo json_encode($result);
?>
