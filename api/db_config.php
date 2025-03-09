
<?php
// Enable detailed error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', '/var/log/php/error.log'); // Make sure this path exists and is writable

// Add a function to log errors for debugging
function log_error($message, $context = null) {
    $timestamp = date('Y-m-d H:i:s');
    $contextInfo = $context ? " | Context: " . json_encode($context) : "";
    $logMessage = "[$timestamp] ERROR: $message$contextInfo\n";
    
    // Log to PHP error log
    error_log($logMessage);
    
    // Also append to a custom log file for the admin dashboard
    $logFile = __DIR__ . '/../logs/admin_dashboard.log';
    
    // Create logs directory if it doesn't exist
    if (!file_exists(__DIR__ . '/../logs')) {
        mkdir(__DIR__ . '/../logs', 0755, true);
    }
    
    // Append to the log file
    file_put_contents($logFile, $logMessage, FILE_APPEND);
    
    return $logMessage;
}

// Make sure directory for logs is created
if (!file_exists(__DIR__ . '/../logs')) {
    mkdir(__DIR__ . '/../logs', 0755, true);
    error_log("Created logs directory");
}

// Database configuration
$db_host = "localhost";
$db_user = "checkin"; // Replace with your MySQL username
$db_pass = "checkin"; // Replace with your MySQL password
$db_name = "checkin";

// Log database connection attempt
log_error("Attempting database connection with host: $db_host", [
    'user' => $db_user,
    'database' => $db_name
]);

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection with detailed error logging
if ($conn->connect_error) {
    log_error("Database connection failed: " . $conn->connect_error, [
        'host' => $db_host,
        'user' => $db_user,
        'database' => $db_name
    ]);
    die("Connection failed: " . $conn->connect_error);
}

log_error("Database connection successful");

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
