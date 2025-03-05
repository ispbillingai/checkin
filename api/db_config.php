
<?php
// Database configuration
$db_host = "localhost";
$db_user = "your_db_username"; // Replace with your MySQL username
$db_pass = "your_db_password"; // Replace with your MySQL password
$db_name = "booking_system";

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Function to secure input data
function secure_input($data) {
    global $conn;
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $conn->real_escape_string($data);
}

// Function to generate a random access code
function generate_access_code() {
    return str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
}
?>
