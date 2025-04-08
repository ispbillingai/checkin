
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
if (!isset($data['id']) || empty($data['id']) ||
    !isset($data['name']) || empty($data['name']) || 
    !isset($data['email']) || empty($data['email'])) {
    echo json_encode(['success' => false, 'message' => 'ID, name, and email are required']);
    exit;
}

// Function to log messages (similar to cron.php)
function logMessage($message) {
    $logFile = __DIR__ . '/../staff_actions.log';
    $time = date('Y-m-d H:i:s');
    $logLine = "[{$time}] {$message}\n";
    file_put_contents($logFile, $logLine, FILE_APPEND);
}

// Function to send HTTP requests (similar to cron.php)
function sendGetRequest($url) {
    logMessage("Sending GET request to: {$url}");
    $result = @file_get_contents($url);
    if ($result === false) {
        logMessage("ERROR: Failed to get a response from {$url}");
        return null;
    }
    $respSnippet = substr($result, 0, 500);
    logMessage("Response from {$url}: {$respSnippet}");
    return $result;
}

try {
    // Connect to database
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if email already exists for another staff member
    $checkStmt = $pdo->prepare("SELECT id FROM staff WHERE email = ? AND id != ?");
    $checkStmt->execute([$data['email'], $data['id']]);
    
    if ($checkStmt->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'Email already exists']);
        exit;
    }
    
    // Get previous staff data to compare changes
    $getPrevStmt = $pdo->prepare("SELECT * FROM staff WHERE id = ?");
    $getPrevStmt->execute([$data['id']]);
    $prevStaffData = $getPrevStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$prevStaffData) {
        echo json_encode(['success' => false, 'message' => 'Staff not found']);
        exit;
    }
    
    // Prepare base update query
    $sql = "UPDATE staff SET name = ?, email = ?, phone = ?, access_all_rooms = ?, rooms = ?, room_positions = ?, entry_points = ?, entry_point_positions = ?";
    $params = [
        $data['name'],
        $data['email'],
        isset($data['phone']) ? $data['phone'] : '',
        isset($data['access_all_rooms']) ? $data['access_all_rooms'] : 0,
        isset($data['rooms']) ? $data['rooms'] : '',
        isset($data['room_positions']) ? $data['room_positions'] : '',
        isset($data['entry_points']) ? $data['entry_points'] : '',
        isset($data['entry_point_positions']) ? $data['entry_point_positions'] : ''
    ];
    
    // Get PIN code - either new one or existing one
    $pinCode = $prevStaffData['pin_code']; // Default to existing PIN
    
    // If password is provided, update it too (as PIN code)
    if (isset($data['password']) && !empty($data['password'])) {
        $sql .= ", pin_code = ?";
        $params[] = $data['password']; // Store directly as PIN code
        $pinCode = $data['password']; // Use new PIN code for door controllers
    }
    
    // Complete the query
    $sql .= " WHERE id = ?";
    $params[] = $data['id'];
    
    // Execute update
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Check if any rows were affected
    if ($stmt->rowCount() == 0) {
        echo json_encode(['success' => false, 'message' => 'Staff not found or no changes made']);
        exit;
    }
    
    logMessage("=== STAFF UPDATE START ===");
    logMessage("Updating staff ID={$data['id']}, name={$data['name']}");
    
    // Determine access changes
    $accessAllRooms = isset($data['access_all_rooms']) ? $data['access_all_rooms'] : 0;
    $rooms = isset($data['rooms']) ? $data['rooms'] : '';
    $roomPositions = isset($data['room_positions']) ? $data['room_positions'] : '';
    $entryPoints = isset($data['entry_points']) ? $data['entry_points'] : '';
    $entryPointPositions = isset($data['entry_point_positions']) ? $data['entry_point_positions'] : '';
    
    // Clear previous room access if access has changed
    $prevRooms = $prevStaffData['rooms'] ? explode(',', $prevStaffData['rooms']) : [];
    $prevRoomPos = $prevStaffData['room_positions'] ? explode(',', $prevStaffData['room_positions']) : [];
    $newRooms = $rooms ? explode(',', $rooms) : [];
    
    // Check if access_all_rooms changed from true to false
    $wasAllRooms = $prevStaffData['access_all_rooms'] == 1;
    $nowAllRooms = $accessAllRooms == 1;
    
    // If access was changed from "all rooms" to specific rooms, we need to clear all room access
    if ($wasAllRooms && !$nowAllRooms) {
        // Get all rooms and clear PIN codes
        $allRoomsStmt = $pdo->prepare("SELECT id, ip_address FROM rooms");
        $allRoomsStmt->execute();
        $allRooms = $allRoomsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($allRooms as $room) {
            $roomId = $room['id'];
            $roomIp = $room['ip_address'];
            // Use position 1 as default for "all rooms" access
            $roomPos = 1;
            
            if (!empty($roomIp) && !in_array($roomId, $newRooms)) {
                $url = "http://{$roomIp}/clu_set1.cgi?box={$roomPos}&value=0";
                sendGetRequest($url);
                logMessage("Cleared PIN code from all-access room ID={$roomId}, position={$roomPos}");
            }
        }
    }
    
    // Clear PIN codes from rooms that are no longer accessible
    if (!$nowAllRooms && !empty($prevRooms)) {
        // Get all previously accessible room IPs in one query
        $prevRoomsStmt = $pdo->prepare("SELECT id, ip_address FROM rooms WHERE id IN (" . implode(',', array_fill(0, count($prevRooms), '?')) . ")");
        $prevRoomsStmt->execute($prevRooms);
        $prevRoomsData = $prevRoomsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Map room IDs to their IPs for easy lookup
        $roomIpMap = [];
        foreach ($prevRoomsData as $room) {
            $roomIpMap[$room['id']] = $room['ip_address'];
        }
        
        // Loop through each previously accessible room
        for ($i = 0; $i < count($prevRooms); $i++) {
            $roomId = $prevRooms[$i];
            $roomPos = isset($prevRoomPos[$i]) ? $prevRoomPos[$i] : 1;
            $roomIp = isset($roomIpMap[$roomId]) ? $roomIpMap[$roomId] : '';
            
            // If this room is no longer in the list, clear its code
            if (!in_array($roomId, $newRooms) && !empty($roomIp)) {
                $url = "http://{$roomIp}/clu_set1.cgi?box={$roomPos}&value=0";
                sendGetRequest($url);
                logMessage("Cleared PIN code from removed room ID={$roomId}, position={$roomPos}");
            }
        }
    }
    
    // Send PIN code to rooms
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
                sendGetRequest($url);
                logMessage("Sent PIN code to room ID={$roomId}, position={$roomPos}");
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
                sendGetRequest($url);
                logMessage("Sent PIN code to all-access room ID={$roomId}, position={$roomPos}");
            } else {
                logMessage("Skipping all-access room code send: Missing IP for room ID={$roomId}");
            }
        }
    }
    
    // Handle entry points similarly to rooms
    $prevEntryPoints = $prevStaffData['entry_points'] ? explode(',', $prevStaffData['entry_points']) : [];
    $prevEntryPos = $prevStaffData['entry_point_positions'] ? explode(',', $prevStaffData['entry_point_positions']) : [];
    $newEntryPoints = $entryPoints ? explode(',', $entryPoints) : [];
    
    // Clear PIN codes from entry points that are no longer accessible
    if (!empty($prevEntryPoints)) {
        // Get all previously accessible entry point IPs in one query
        $prevEntryStmt = $pdo->prepare("SELECT id, ip_address FROM entry_points WHERE id IN (" . implode(',', array_fill(0, count($prevEntryPoints), '?')) . ")");
        $prevEntryStmt->execute($prevEntryPoints);
        $prevEntryData = $prevEntryStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Map entry point IDs to their IPs for easy lookup
        $entryIpMap = [];
        foreach ($prevEntryData as $entry) {
            $entryIpMap[$entry['id']] = $entry['ip_address'];
        }
        
        // Loop through each previously accessible entry point
        for ($i = 0; $i < count($prevEntryPoints); $i++) {
            $entryId = $prevEntryPoints[$i];
            $entryPos = isset($prevEntryPos[$i]) ? $prevEntryPos[$i] : 1;
            $entryIp = isset($entryIpMap[$entryId]) ? $entryIpMap[$entryId] : '';
            
            // If this entry point is no longer in the list, clear its code
            if (!in_array($entryId, $newEntryPoints) && !empty($entryIp)) {
                $url = "http://{$entryIp}/clu_set1.cgi?box={$entryPos}&value=0";
                sendGetRequest($url);
                logMessage("Cleared PIN code from removed entry point ID={$entryId}, position={$entryPos}");
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
                sendGetRequest($url);
                logMessage("Sent PIN code to entry point ID={$entryId}, position={$entryPos}");
            } else {
                logMessage("Skipping entry point code send: Missing IP for entry ID={$entryId}");
            }
        }
    }
    
    logMessage("=== STAFF UPDATE END ===");
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Staff updated successfully'
    ]);
} catch (PDOException $e) {
    // Log error and return error response
    error_log("Database error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
