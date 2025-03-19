
<?php
// Start session
session_start();

// Include database configuration
require_once 'db_config.php';

// Set content type to JSON
header('Content-Type: application/json');

// Generate a random PIN code (4-6 digits)
function generate_pin_code($length = 4) {
    $length = min(max($length, 4), 6); // Ensure length is between 4 and 6
    return str_pad(mt_rand(0, pow(10, $length) - 1), $length, '0', STR_PAD_LEFT);
}

// Check if this is a POST request
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get post parameters
    $pin_length = isset($_POST['length']) ? intval($_POST['length']) : 4;
    
    // Generate PIN code
    $pin_code = generate_pin_code($pin_length);
    
    // Return success response
    echo json_encode([
        'success' => true,
        'pin_code' => $pin_code
    ]);
} else {
    // Return error for non-POST requests
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}
?>
