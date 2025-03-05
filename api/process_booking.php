
<?php
// Start session
session_start();

// Check if it's a POST request
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Include database configuration
require_once 'db_config.php';

// Get form data
$room = $_POST['room'] ?? '';
$arrivalDateTime = $_POST['arrivalDateTime'] ?? '';
$departureDateTime = $_POST['departureDateTime'] ?? '';
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$phone = $_POST['phone'] ?? '';

// Validate input
if (empty($room) || empty($arrivalDateTime) || empty($departureDateTime) || empty($name) || empty($email) || empty($phone)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

// Generate a random 6-digit access code
$accessCode = mt_rand(100000, 999999);

try {
    // Connect to database
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Prepare SQL statement
    $stmt = $conn->prepare("INSERT INTO bookings (room_id, guest_name, email, phone, arrival_datetime, departure_datetime, access_code) 
                            VALUES (:room, :name, :email, :phone, :arrival, :departure, :access_code)");
    
    // Bind parameters
    $stmt->bindParam(':room', $room);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':arrival', $arrivalDateTime);
    $stmt->bindParam(':departure', $departureDateTime);
    $stmt->bindParam(':access_code', $accessCode);
    
    // Execute the statement
    $stmt->execute();
    
    // Send email to user with access code
    $to = $email;
    $subject = "Your Booking Confirmation";
    $message = "
    <html>
    <head>
        <title>Booking Confirmation</title>
    </head>
    <body>
        <h2>Booking Confirmation</h2>
        <p>Dear $name,</p>
        <p>Your booking has been confirmed with the following details:</p>
        <table style='border-collapse: collapse; width: 100%;'>
            <tr>
                <td style='border: 1px solid #ddd; padding: 8px;'><strong>Room:</strong></td>
                <td style='border: 1px solid #ddd; padding: 8px;'>$room</td>
            </tr>
            <tr>
                <td style='border: 1px solid #ddd; padding: 8px;'><strong>Check-in:</strong></td>
                <td style='border: 1px solid #ddd; padding: 8px;'>$arrivalDateTime</td>
            </tr>
            <tr>
                <td style='border: 1px solid #ddd; padding: 8px;'><strong>Check-out:</strong></td>
                <td style='border: 1px solid #ddd; padding: 8px;'>$departureDateTime</td>
            </tr>
            <tr>
                <td style='border: 1px solid #ddd; padding: 8px;'><strong>Access Code:</strong></td>
                <td style='border: 1px solid #ddd; padding: 8px;'><h3>$accessCode</h3></td>
            </tr>
        </table>
        <p>Please use this access code during your stay.</p>
        <p>Thank you for choosing our service!</p>
    </body>
    </html>
    ";
    
    // Set content-type header for sending HTML email
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: noreply@example.com" . "\r\n";
    
    // Send email (commented out for testing)
    // mail($to, $subject, $message, $headers);
    
    // Return success response
    echo json_encode([
        'success' => true, 
        'message' => 'Booking created successfully', 
        'data' => [
            'bookingId' => $conn->lastInsertId(),
            'accessCode' => $accessCode
        ]
    ]);
    
} catch(PDOException $e) {
    // Return error response
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
