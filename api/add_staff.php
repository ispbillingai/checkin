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
if (!isset($data['name']) || empty($data['name']) || 
    !isset($data['email']) || empty($data['email']) ||
    !isset($data['password']) || empty($data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Name, email, and PIN code are required']);
    exit;
}

// Function to log messages (similar to cron.php)
function logMessage($message) {
    $logFile = __DIR__ . '/../staff_actions.log';
    $time = date('Y-m-d H:i:s');
    $logLine = "[{$time}] {$message}\n";
    file_put_contents($logFile, $logLine, FILE_APPEND);
}

// Non-blocking function to send HTTP requests in the background
function sendAsyncRequest($url) {
    logMessage("Sending async GET request to: {$url}");
    
    // Use file_get_contents in non-blocking mode (fire and forget)
    $opts = [
        'http' => [
            'timeout' => 0.01, // Very short timeout for non-blocking behavior
        ]
    ];
    $context = stream_context_create($opts);
    @file_get_contents($url, false, $context);
    
    // Immediately log success - actual success will be determined by door controller
    logMessage("Async request initiated to: {$url}");
    return true;
}

try {
    // Connect to database
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if email already exists
    $checkStmt = $pdo->prepare("SELECT id FROM staff WHERE email = ?");
    $checkStmt->execute([$data['email']]);
    
    if ($checkStmt->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'Email already exists']);
        exit;
    }
    
    // Insert new staff
    $stmt = $pdo->prepare("INSERT INTO staff (name, email, phone, pin_code, access_all_rooms, rooms, room_positions, entry_points, entry_point_positions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    // Store the pin code as is, no hashing needed since it's an entry code
    $pinCode = $data['password']; // Using the 'password' field from the form as the PIN code
    $accessAllRooms = isset($data['access_all_rooms']) ? $data['access_all_rooms'] : 0;
    $rooms = isset($data['rooms']) ? $data['rooms'] : '';
    $roomPositions = isset($data['room_positions']) ? $data['room_positions'] : '';
    $entryPoints = isset($data['entry_points']) ? $data['entry_points'] : '';
    $entryPointPositions = isset($data['entry_point_positions']) ? $data['entry_point_positions'] : '';
    
    // Add PIN code length validation
    if (strlen($pinCode) > 15) {
        echo json_encode([
            'success' => false, 
            'message' => 'PIN code must be 15 characters or less'
        ]);
        exit;
    }
    
    $stmt->execute([
        $data['name'],
        $data['email'],
        isset($data['phone']) ? $data['phone'] : '',
        $pinCode,
        $accessAllRooms,
        $rooms,
        $roomPositions,
        $entryPoints,
        $entryPointPositions
    ]);
    
    $staffId = $pdo->lastInsertId();
    
    // Return success response immediately so frontend doesn't wait
    echo json_encode([
        'success' => true,
        'message' => 'Staff added successfully',
        'id' => $staffId
    ]);
    
    // Flush output buffer to send response immediately
    if (ob_get_level()) ob_end_flush();
    flush();
    
    // Log start of background process
    logMessage("=== STAFF ADD START ===");
    logMessage("Adding staff ID={$staffId}, name={$data['name']}, pin={$pinCode}");
    
    // Send PIN code to rooms if access to specific rooms was granted (in background)
    if (!$accessAllRooms && !empty($rooms) && !empty($roomPositions)) {
        $roomIds = explode(',', $rooms);
        $roomPosArray = explode(',', $roomPositions);
        
        // Get all room IPs in one query
        $roomsStmt = $pdo->prepare("SELECT id, ip_address FROM rooms WHERE id IN (" . implode(',', array_fill(0, count($roomIds), '?')) . ")");
        $roomsStmt->execute($roomIds);
        $roomsData = $roomsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Map room IDs to their IPs for easy lookup
        $roomIpMap = [];
        foreach ($roomsData as $room) {
            $roomIpMap[$room['id']] = $room['ip_address'];
        }
        
        // Loop through each room and send PIN code
        for ($i = 0; $i < count($roomIds); $i++) {
            $roomId = $roomIds[$i];
            $roomPos = isset($roomPosArray[$i]) ? $roomPosArray[$i] : 1;
            $roomIp = isset($roomIpMap[$roomId]) ? $roomIpMap[$roomId] : '';
            
            if (!empty($roomIp)) {
                $url = "http://{$roomIp}/clu_set1.cgi?box={$roomPos}&value={$pinCode}";
                sendAsyncRequest($url);
                logMessage("Initiated PIN code send to room ID={$roomId}, position={$roomPos}");
            } else {
                logMessage("Skipping room code send: Missing IP for room ID={$roomId}");
            }
        }
    } elseif ($accessAllRooms) {
        // If staff has access to all rooms, get all rooms and set PIN code
        $allRoomsStmt = $pdo->prepare("SELECT id, ip_address FROM rooms");
        $allRoomsStmt->execute();
        $allRooms = $allRoomsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($allRooms as $room) {
            $roomId = $room['id'];
            $roomIp = $room['ip_address'];
            // Use position 1 as default for "all rooms" access
            $roomPos = 1;
            
            if (!empty($roomIp)) {
                $url = "http://{$roomIp}/clu_set1.cgi?box={$roomPos}&value={$pinCode}";
                sendAsyncRequest($url);
                logMessage("Initiated PIN code send to all-access room ID={$roomId}, position={$roomPos}");
            } else {
                logMessage("Skipping all-access room code send: Missing IP for room ID={$roomId}");
            }
        }
    }
    
    // Send PIN code to entry points
    if (!empty($entryPoints) && !empty($entryPointPositions)) {
        $entryPointIds = explode(',', $entryPoints);
        $entryPosArray = explode(',', $entryPointPositions);
        
        // Get all entry point IPs in one query
        $entryStmt = $pdo->prepare("SELECT id, ip_address FROM entry_points WHERE id IN (" . implode(',', array_fill(0, count($entryPointIds), '?')) . ")");
        $entryStmt->execute($entryPointIds);
        $entryData = $entryStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Map entry point IDs to their IPs for easy lookup
        $entryIpMap = [];
        foreach ($entryData as $entry) {
            $entryIpMap[$entry['id']] = $entry['ip_address'];
        }
        
        // Loop through each entry point and send PIN code
        for ($i = 0; $i < count($entryPointIds); $i++) {
            $entryId = $entryPointIds[$i];
            $entryPos = isset($entryPosArray[$i]) ? $entryPosArray[$i] : 1;
            $entryIp = isset($entryIpMap[$entryId]) ? $entryIpMap[$entryId] : '';
            
            if (!empty($entryIp)) {
                $url = "http://{$entryIp}/clu_set1.cgi?box={$entryPos}&value={$pinCode}";
                sendAsyncRequest($url);
                logMessage("Initiated PIN code send to entry point ID={$entryId}, position={$entryPos}");
            } else {
                logMessage("Skipping entry point code send: Missing IP for entry ID={$entryId}");
            }
        }
    }
    
    logMessage("=== STAFF ADD END ===");
    
} catch (PDOException $e) {
    // Log error and return error response
    error_log("Database error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
