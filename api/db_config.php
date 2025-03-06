<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', '/var/log/php/error.log'); // Make sure this path exists and is writable

// Log database connection attempt
error_log("Attempting database connection with host: $db_host");

// Database configuration
$db_host = "localhost";
$db_user = "your_db_username"; 
$db_pass = "your_db_password"; 
$db_name = "booking_system";

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection with detailed error logging
if ($conn->connect_error) {
    error_log("Database connection failed: " . $conn->connect_error);
    error_log("Connection details - Host: $db_host, User: $db_user, Database: $db_name");
    die("Connection failed: " . $conn->connect_error);
}

error_log("Database connection successful");

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
