
<?php
require_once '../php/db_config.php';

// Check if the request has a valid authorization header
$headers = getallheaders();
if (!isset($headers['Authorization']) || empty($headers['Authorization'])) {
    echo json_encode(['success' => false, 'message' => 'Authorization required']);
    exit;
}

// Extract the token from the Authorization header
$authHeader = $headers['Authorization'];
$token = str_replace('Bearer ', '', $authHeader);

// Verify the token (simple check for now - in production, use proper JWT validation)
if (empty($token)) {
    echo json_encode(['success' => false, 'message' => 'Invalid token']);
    exit;
}

// Get JSON data from request body
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate required fields
if (!isset($data['id']) || empty($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'Staff ID is required']);
    exit;
}

// Function to log messages (similar to cron.php)
function logMessage($message) {
    $logFile = __DIR__ . '/../staff_actions.log';
    $time = date('Y-m-d H:i:s');
    $logLine = "[{$time}] {$message}\n";
    file_put_contents($logFile, $logLine, FILE_APPEND);
}

// Enhanced function to send HTTP requests with better handling for multiple requests
function sendAsyncRequest($url, $deviceType = '', $deviceId = '', $position = '', $pinCode = '') {
    // Log detailed information about the request
    logMessage("SENDING REQUEST: Device={$deviceType}, ID={$deviceId}, Position={$position}, PIN={$pinCode}");
    logMessage("REQUEST URL: {$url}");
    
    // Validate URL format
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        logMessage("ERROR: Invalid URL format: {$url}");
        return false;
    }
    
    // Use file_get_contents in non-blocking mode but with a slightly longer timeout
    // to ensure the request is properly initiated
    $opts = [
        'http' => [
            'timeout' => 0.5, // Slightly longer timeout to ensure the request is initiated
            'ignore_errors' => true, // Don't throw exceptions on HTTP errors
            'header' => "Connection: Close\r\n" // Close connection immediately after request
        ]
    ];
    
    $context = stream_context_create($opts);
    
    // Attempt to send the request and log the result
    try {
        @file_get_contents($url, false, $context);
        logMessage("REQUEST SENT: Request initiated to {$deviceType} ID={$deviceId}, Position={$position}");
        
        // Small sleep to ensure requests are processed separately
        // This helps when sending multiple requests to the same IP with different positions
        usleep(100000); // 100ms delay between requests
        
        return true;
    } catch (Exception $e) {
        logMessage("ERROR: Exception when sending request: " . $e->getMessage());
        return false;
    }
}

try {
    // Connect to database
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get staff data before deleting to clear access codes
    $getStaffStmt = $pdo->prepare("SELECT * FROM staff WHERE id = ?");
    $getStaffStmt->execute([$data['id']]);
    $staffData = $getStaffStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$staffData) {
        echo json_encode(['success' => false, 'message' => 'Staff not found']);
        exit;
    }
    
    // Send success response immediately
    echo json_encode([
        'success' => true,
        'message' => 'Staff deleted successfully'
    ]);
    
    // Flush output buffer to send response immediately
    if (ob_get_level()) ob_end_flush();
    flush();
    
    logMessage("=== STAFF DELETE START ===");
    logMessage("Deleting staff ID={$data['id']}, name={$staffData['name']}");
    
    // Clear room access
    $accessAllRooms = $staffData['access_all_rooms'] == 1;
    $rooms = $staffData['rooms'] ? explode(',', $staffData['rooms']) : [];
    $roomPositions = $staffData['room_positions'] ? explode(',', $staffData['room_positions']) : [];
    
    if ($accessAllRooms) {
        // If staff had access to all rooms, clear all room access
        $allRoomsStmt = $pdo->prepare("SELECT id, ip_address FROM rooms");
        $allRoomsStmt->execute();
        $allRooms = $allRoomsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $processedCount = 0;
        foreach ($allRooms as $room) {
            $roomId = $room['id'];
            $roomIp = $room['ip_address'];
            // Use position 1 as default for "all rooms" access
            $roomPos = 1;
            
            if (!empty($roomIp)) {
                if (strpos($roomIp, 'http://') !== 0 && strpos($roomIp, 'https://') !== 0) {
                    $roomIp = 'http://' . $roomIp;
                }
                
                $url = $roomIp . "/clu_set1.cgi?box={$roomPos}&value=0";
                sendAsyncRequest($url, "All-Access Room", $roomId, $roomPos, "0");
                $processedCount++;
                logMessage("Cleared PIN code from all-access room {$processedCount}: ID={$roomId}, position={$roomPos}");
            }
        }
    } elseif (!empty($rooms)) {
        // Get all room IPs in one query
        $roomsStmt = $pdo->prepare("SELECT id, ip_address FROM rooms WHERE id IN (" . implode(',', array_fill(0, count($rooms), '?')) . ")");
        $roomsStmt->execute($rooms);
        $roomsData = $roomsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Map room IDs to their IPs for easy lookup
        $roomIpMap = [];
        foreach ($roomsData as $room) {
            $roomIpMap[$room['id']] = $room['ip_address'];
        }
        
        // Loop through each room and clear PIN code
        for ($i = 0; $i < count($rooms); $i++) {
            $roomId = $rooms[$i];
            $roomPos = isset($roomPositions[$i]) ? $roomPositions[$i] : 1;
            $roomIp = isset($roomIpMap[$roomId]) ? $roomIpMap[$roomId] : '';
            
            if (!empty($roomIp)) {
                if (strpos($roomIp, 'http://') !== 0 && strpos($roomIp, 'https://') !== 0) {
                    $roomIp = 'http://' . $roomIp;
                }
                
                $url = $roomIp . "/clu_set1.cgi?box={$roomPos}&value=0";
                sendAsyncRequest($url, "Room", $roomId, $roomPos, "0");
                logMessage("Cleared PIN code from room {$i+1} of " . count($rooms) . ": ID={$roomId}, position={$roomPos}");
            }
        }
    }
    
    // Clear entry point access
    $entryPoints = $staffData['entry_points'] ? explode(',', $staffData['entry_points']) : [];
    $entryPositions = $staffData['entry_point_positions'] ? explode(',', $staffData['entry_point_positions']) : [];
    
    if (!empty($entryPoints)) {
        // Get all entry point IPs in one query
        $entryStmt = $pdo->prepare("SELECT id, ip_address FROM entry_points WHERE id IN (" . implode(',', array_fill(0, count($entryPoints), '?')) . ")");
        $entryStmt->execute($entryPoints);
        $entryData = $entryStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Map entry point IDs to their IPs for easy lookup
        $entryIpMap = [];
        foreach ($entryData as $entry) {
            $entryIpMap[$entry['id']] = $entry['ip_address'];
        }
        
        // Loop through each entry point and clear PIN code
        for ($i = 0; $i < count($entryPoints); $i++) {
            $entryId = $entryPoints[$i];
            $entryPos = isset($entryPositions[$i]) ? $entryPositions[$i] : 1;
            $entryIp = isset($entryIpMap[$entryId]) ? $entryIpMap[$entryId] : '';
            
            if (!empty($entryIp)) {
                if (strpos($entryIp, 'http://') !== 0 && strpos($entryIp, 'https://') !== 0) {
                    $entryIp = 'http://' . $entryIp;
                }
                
                $url = $entryIp . "/clu_set1.cgi?box={$entryPos}&value=0";
                sendAsyncRequest($url, "Entry Point", $entryId, $entryPos, "0");
                logMessage("Cleared PIN code from entry point {$i+1} of " . count($entryPoints) . ": ID={$entryId}, position={$entryPos}");
            }
        }
    }
    
    // Delete staff
    $stmt = $pdo->prepare("DELETE FROM staff WHERE id = ?");
    $stmt->execute([$data['id']]);
    
    logMessage("Staff ID={$data['id']} successfully deleted from database");
    logMessage("=== STAFF DELETE END ===");
    
} catch (PDOException $e) {
    // Log error and return error response
    error_log("Database error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
