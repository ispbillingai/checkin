
<?php
// Enable CORS for development
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include database configuration
require_once 'db_config.php';

// Check if it's a POST request
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get the raw POST data
$rawData = file_get_contents('php://input');
$jsonData = json_decode($rawData, true);

// Validate the input
if (json_last_error() !== JSON_ERROR_NONE) {
    log_error("Invalid JSON received: " . $rawData);
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
    exit;
}

// Make sure required fields are present
if (!isset($jsonData['message']) || !isset($jsonData['level'])) {
    log_error("Missing required fields in client error log", $jsonData);
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Log the error to our custom log file
$clientMessage = $jsonData['message'];
$clientLevel = $jsonData['level'];
$clientDetails = $jsonData['details'] ?? null;
$clientTimestamp = $jsonData['timestamp'] ?? date('Y-m-d H:i:s');

// Log to our server-side log
$logMessage = log_error("CLIENT ($clientLevel): $clientMessage", [
    'details' => $clientDetails,
    'timestamp' => $clientTimestamp,
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'Unknown'
]);

// Store in database if we have a client_logs table
$storeInDb = false;
try {
    // Check if the client_logs table exists
    $result = $conn->query("SHOW TABLES LIKE 'client_logs'");
    $storeInDb = $result->num_rows > 0;
    
    if ($storeInDb) {
        // Prepare and bind
        $stmt = $conn->prepare("INSERT INTO client_logs (level, message, details, user_agent, ip_address) VALUES (?, ?, ?, ?, ?)");
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
        $detailsJson = $clientDetails ? json_encode($clientDetails) : null;
        
        $stmt->bind_param("sssss", $clientLevel, $clientMessage, $detailsJson, $userAgent, $ipAddress);
        $stmt->execute();
        $stmt->close();
    }
} catch (Exception $e) {
    log_error("Error storing client log in database: " . $e->getMessage());
    // Continue processing - don't exit
}

// Return success
http_response_code(200);
echo json_encode([
    'success' => true, 
    'message' => 'Log recorded',
    'stored_in_db' => $storeInDb,
    'log_entry' => $logMessage
]);
?>
