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
if (!isset($data['id']) || empty($data['id']) || !is_numeric($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'Valid staff ID is required']);
    exit;
}

// Function to log messages
function logMessage($message) {
    $logFile = __DIR__ . '/../staff_actions.log';
    $time = date('Y-m-d H:i:s');
    $logLine = "[{$time}] {$message}\n";
    file_put_contents($logFile, $logLine, FILE_APPEND);
}

// Function to send HTTP requests
function sendAsyncRequest($url, $deviceType = '', $deviceId = '', $position = '', $pinCode = '') {
    logMessage("SENDING REQUEST: Device={$deviceType}, ID={$deviceId}, Position={$position}, PIN={$pinCode}");
    logMessage("REQUEST URL: {$url}");
    
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        logMessage("ERROR: Invalid URL format: {$url}");
        return false;
    }
    
    $opts = [
        'http' => [
            'timeout' => 0.5,
            'ignore_errors' => true,
            'header' => "Connection: Close\r\n"
        ]
    ];
    
    $context = stream_context_create($opts);
    
    try {
        @file_get_contents($url, false, $context);
        logMessage("REQUEST SENT: Request initiated to {$deviceType} ID={$deviceId}, Position={$position}");
        usleep(100000);
        return true;
    } catch (Exception $e) {
        logMessage("ERROR: Exception when sending request: {$e->getMessage()}");
        return false;
    }
}

try {
    // Connect to database
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get staff data before deleting
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
    
    // Flush output buffer
    if (ob_get_level()) ob_end_flush();
    flush();
    
    logMessage("=== STAFF DELETE START ===");
    logMessage("Deleting staff ID={$data['id']}, name={$staffData['name']}");
    
    // Clear room access
    $accessAllRooms = $staffData['access_all_rooms'] == 1;
    $rooms = $staffData['rooms'] ? explode(',', $staffData['rooms']) : [];
    $roomPositions = $staffData['room_positions'] ? explode(',', $staffData['room_positions']) : [];
    
    if ($accessAllRooms) {
        $allRoomsStmt = $pdo->prepare("SELECT id, ip_address FROM rooms");
        $allRoomsStmt->execute();
        $allRooms = $allRoomsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        logMessage("Clearing PIN codes for all rooms (access_all_rooms)");
        $processedCount = 0;
        foreach ($allRooms as $room) {
            $roomId = $room['id'];
            $roomIp = $room['ip_address'];
            $roomPos = 1;
            
            if (!empty($roomIp)) {
                $roomIp = strpos($roomIp, 'http://') === 0 || strpos($roomIp, 'https://') === 0 ? $roomIp : 'http://' . $roomIp;
                $url = "{$roomIp}/clu_set1.cgi?box={$roomPos}&value=0";
                sendAsyncRequest($url, "All-Access Room", $roomId, $roomPos, "0");
                $processedCount++;
                logMessage("Cleared PIN code from all-access room {$processedCount}: ID={$roomId}, position={$roomPos}");
            } else {
                logMessage("ERROR: Missing IP for all-access room ID={$roomId}");
            }
        }
    } elseif (!empty($rooms)) {
        $roomsStmt = $pdo->prepare("SELECT id, ip_address FROM rooms WHERE id IN (" . implode(',', array_fill(0, count($rooms), '?')) . ")");
        $roomsStmt->execute($rooms);
        $roomsData = $roomsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        logMessage("Retrieved " . count($roomsData) . " room IPs for clearing");
        $roomIpMap = [];
        foreach ($roomsData as $room) {
            $roomIpMap[$room['id']] = $room['ip_address'];
            logMessage("Room ID={$room['id']} has IP={$room['ip_address']}");
        }
        
        for ($i = 0; $i < count($rooms); $i++) {
            $roomId = $rooms[$i];
            $roomPos = isset($roomPositions[$i]) ? $roomPositions[$i] : 1;
            $roomIp = isset($roomIpMap[$roomId]) ? $roomIpMap[$roomId] : '';
            
            if (!empty($roomIp)) {
                $roomIp = strpos($roomIp, 'http://') === 0 || strpos($roomIp, 'https://') === 0 ? $roomIp : 'http://' . $roomIp;
                $url = "{$roomIp}/clu_set1.cgi?box={$roomPos}&value=0";
                sendAsyncRequest($url, "Room", $roomId, $roomPos, "0");
                logMessage("Cleared PIN code from room " . ($i + 1) . " of " . count($rooms) . ": ID={$roomId}, position={$roomPos}");
            } else {
                logMessage("ERROR: Missing IP for room ID={$roomId}");
            }
        }
    }
    
    // Clear entry point access
    $entryPoints = $staffData['entry_points'] ? explode(',', $staffData['entry_points']) : [];
    $entryPositions = $staffData['entry_point_positions'] ? explode(',', $staffData['entry_point_positions']) : [];
    
    if (!empty($entryPoints)) {
        $entryStmt = $pdo->prepare("SELECT id, ip_address FROM entry_points WHERE id IN (" . implode(',', array_fill(0, count($entryPoints), '?')) . ")");
        $entryStmt->execute($entryPoints);
        $entryData = $entryStmt->fetchAll(PDO::FETCH_ASSOC);
        
        logMessage("Retrieved " . count($entryData) . " entry point IPs for clearing");
        $entryIpMap = [];
        foreach ($entryData as $entry) {
            $entryIpMap[$entry['id']] = $entry['ip_address'];
            logMessage("Entry Point ID={$entry['id']} has IP={$entry['ip_address']}");
        }
        
        for ($i = 0; $i < count($entryPoints); $i++) {
            $entryId = $entryPoints[$i];
            $entryPos = isset($entryPositions[$i]) ? $entryPositions[$i] : 1;
            $entryIp = isset($entryIpMap[$entryId]) ? $entryIpMap[$entryId] : '';
            
            if (!empty($entryIp)) {
                $entryIp = strpos($entryIp, 'http://') === 0 || strpos($entryIp, 'https://') === 0 ? $entryIp : 'http://' . $entryIp;
                $url = "{$entryIp}/clu_set1.cgi?box={$entryPos}&value=0";
                sendAsyncRequest($url, "Entry Point", $entryId, $entryPos, "0");
                logMessage("Cleared PIN code from entry point " . ($i + 1) . " of " . count($entryPoints) . ": ID={$entryId}, position={$entryPos}");
            } else {
                logMessage("ERROR: Missing IP for entry point ID={$entryId}");
            }
        }
    }
    
    // Delete staff
    $stmt = $pdo->prepare("DELETE FROM staff WHERE id = ?");
    $stmt->execute([$data['id']]);
    
    logMessage("Staff ID={$data['id']} successfully deleted from database");
    logMessage("=== STAFF DELETE END ===");
    
} catch (PDOException $e) {
    error_log("Database error: {$e->getMessage()}");
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>