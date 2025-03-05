
<?php
// Include database configuration
require_once 'db_config.php';

// Start session
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'User not authenticated'
    ]);
    exit;
}

// Handle booking creation request
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get data from POST
    $room_id = secure_input($_POST['room']);
    $arrival_date_time = secure_input($_POST['arrivalDateTime']);
    $departure_date_time = secure_input($_POST['departureDateTime']);
    $guest_name = secure_input($_POST['name']);
    $email = secure_input($_POST['email']);
    $phone = secure_input($_POST['phone']);
    
    // Generate access code
    $access_code = generate_access_code();
    
    // Current timestamp
    $created_at = date('Y-m-d H:i:s');
    
    // Prepare SQL statement
    $stmt = $conn->prepare("INSERT INTO bookings (room_id, guest_name, email, phone, arrival_date_time, departure_date_time, access_code, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssssss", $room_id, $guest_name, $email, $phone, $arrival_date_time, $departure_date_time, $access_code, $created_at);
    
    if ($stmt->execute()) {
        // Send email with access code (simplified for demo)
        $to = $email;
        $subject = "Your Booking Confirmation and Access Code";
        $message = "
        <html>
        <head>
            <title>Booking Confirmation</title>
        </head>
        <body>
            <h2>Booking Confirmation</h2>
            <p>Dear $guest_name,</p>
            <p>Your booking has been confirmed:</p>
            <ul>
                <li><strong>Room:</strong> " . $room_id . "</li>
                <li><strong>Check-in:</strong> " . $arrival_date_time . "</li>
                <li><strong>Check-out:</strong> " . $departure_date_time . "</li>
                <li><strong>Access Code:</strong> <span style='font-size:18px;font-weight:bold;'>" . $access_code . "</span></li>
            </ul>
            <p>Please use this access code to enter your room.</p>
            <p>Thank you for choosing our service!</p>
        </body>
        </html>
        ";
        
        // To send HTML mail, the Content-type header must be set
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= 'From: booking@example.com' . "\r\n";
        
        // Send email (commented out as this requires a mail server)
        // mail($to, $subject, $message, $headers);
        
        // Return success JSON
        echo json_encode([
            'success' => true,
            'message' => 'Booking created successfully',
            'accessCode' => $access_code
        ]);
    } else {
        // Return error JSON
        echo json_encode([
            'success' => false,
            'message' => 'Error creating booking: ' . $stmt->error
        ]);
    }
} else {
    // Return error for non-POST requests
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}

// Close database connection
$conn->close();
?>
