
<?php
// Start session
session_start();

// Include database configuration
require_once 'db_config.php';

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || !isset($_SESSION['is_admin']) || $_SESSION['is_admin'] != 1) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access'
    ]);
    exit;
}

// Check if this is a POST request
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
    exit;
}

// Get post parameters
$entry_point_id = isset($_POST['entry_point_id']) ? secure_input($_POST['entry_point_id']) : '';
$position = isset($_POST['position']) ? intval($_POST['position']) : 0;
$pin_code = isset($_POST['pin_code']) ? secure_input($_POST['pin_code']) : '';
$booking_id = isset($_POST['booking_id']) ? intval($_POST['booking_id']) : 0;

// Validate inputs
if (empty($entry_point_id) || $position < 1 || $position > 64 || empty($pin_code) || $booking_id <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing or invalid parameters'
    ]);
    exit;
}

try {
    // Check if entry point exists
    $stmt = $conn->prepare("SELECT id FROM entry_points WHERE id = ?");
    $stmt->bind_param("s", $entry_point_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Entry point not found'
        ]);
        exit;
    }
    
    // Check if booking exists
    $stmt = $conn->prepare("SELECT id FROM bookings WHERE id = ?");
    $stmt->bind_param("i", $booking_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Booking not found'
        ]);
        exit;
    }
    
    // Check if there's already a PIN at this position
    $stmt = $conn->prepare("SELECT id FROM entry_point_pins WHERE entry_point_id = ? AND position = ?");
    $stmt->bind_param("si", $entry_point_id, $position);
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Begin transaction
    $conn->begin_transaction();
    
    if ($result->num_rows > 0) {
        // Update existing PIN
        $pin_id = $result->fetch_assoc()['id'];
        $stmt = $conn->prepare("UPDATE entry_point_pins SET pin_code = ?, booking_id = ? WHERE id = ?");
        $stmt->bind_param("sii", $pin_code, $booking_id, $pin_id);
    } else {
        // Insert new PIN
        $stmt = $conn->prepare("INSERT INTO entry_point_pins (entry_point_id, position, pin_code, booking_id) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("sisi", $entry_point_id, $position, $pin_code, $booking_id);
    }
    
    if ($stmt->execute()) {
        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'PIN assigned successfully'
        ]);
    } else {
        // Rollback transaction
        $conn->rollback();
        
        echo json_encode([
            'success' => false,
            'message' => 'Error assigning PIN: ' . $stmt->error
        ]);
    }
} catch (Exception $e) {
    // Rollback transaction if active
    if ($conn->connect_errno === 0) {
        $conn->rollback();
    }
    
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

// Close connection
$conn->close();
?>
