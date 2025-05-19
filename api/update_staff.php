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

// Function to log messages
function logMessage($message) {
    $logFile = __DIR__ . '/../staff_actions.log';
    $time = date('Y-m-d H:i:s');
    $logLine = "[{$time}] {$message}\n";
    file_put_contents($logFile, $logLine, FILE_APPEND);
}

// Enhanced function to send HTTP requests with better handling for multiple requests
function sendAsyncRequest($url, $deviceType, $deviceId, $position, $pinCode) {
    logMessage("SENDING PIN: Device={$deviceType}, ID={$deviceId}, Position={$position}, PIN={$pinCode}");
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
        logMessage("PIN CODE SENT: Request initiated to {$deviceType} ID={$deviceId}, Position={$position}");
        usleep(100000);
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
        $params[] = $data['password'];
        $pinCode = $data['password'];
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
    
    // Return success response immediately
    echo json_encode([
        'success' => true,
        'message' => 'Staff updated successfully'
    ]);
    
    // Flush output buffer to send response immediately
    if (ob_get_level()) ob_end_flush();
    flush();
    
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
    
    // If access was changed from "all rooms" to specific rooms, clear all room access
    if ($wasAllRooms && !$nowAllRooms) {
        $allRoomsStmt = $pdo->prepare("SELECT id, ip_address FROM rooms");
        $allRoomsStmt->execute();
        $allRooms = $allRoomsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        logMessage("Clearing PIN codes from all rooms due to access change (was all, now specific)");
        
        $processedCount = 0;
        foreach ($allRooms as $room) {
            $roomId = $room['id'];
            $roomIp = $room['ip_address'];
            $roomPos = 1;
            // Subtract 1 to account for card's +1 adjustment
            $cardPos = $roomPos - 1;
            
            if (!empty($roomIp) && !in_array($roomId, $newRooms)) {
                if (strpos($roomIp, 'http://') !== 0 && strpos($roomIp, 'https://') !== 0) {
                    $roomIp = 'http://' . $roomIp;
                }
                
                $url = "{$roomIp}/clu_set1.cgi?box={$cardPos}&value=0";
                sendAsyncRequest($url, "Ex-All-Access Room", $roomId, $cardPos, "0");
                $processedCount++;
                logMessage("Cleared all-access room {$processedCount}: ID={$roomId}, card position {$cardPos} (database position {$roomPos}, card clears position " . ($cardPos + 1) . ")");
            }
        }
    }
    
    // Clear PIN codes from rooms that are no longer accessible
    if (!$nowAllRooms && !empty($prevRooms)) {
        $prevRoomsStmt = $pdo->prepare("SELECT id, ip_address FROM rooms WHERE id IN (" . implode(',', array_fill(0, count($prevRooms), '?')) . ")");
        $prevRoomsStmt->execute($prevRooms);
        $prevRoomsData = $prevRoomsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        logMessage("Retrieved " . count($prevRoomsData) . " previously accessible room IPs");
        
        $roomIpMap = [];
        foreach ($prevRoomsData as $room) {
            $roomIpMap[$room['id']] = $room['ip_address'];
            logMessage("Previous Room ID={$room['id']} has IP={$room['ip_address']}");
        }
        
        $processedCount = 0;
        for ($i = 0; $i < count($prevRooms); $i++) {
            $roomId = $prevRooms[$i];
            $roomPos = isset($prevRoomPos[$i]) ? $prevRoomPos[$i] : 1;
            // Subtract 1 to account for card's +1 adjustment
            $cardPos = (int)$roomPos - 1;
            $roomIp = isset($roomIpMap[$roomId]) ? $roomIpMap[$roomId] : '';
            
            if ($cardPos < 0) {
                logMessage("ERROR: Invalid card position {$cardPos} for room ID={$roomId}, database position={$roomPos}");
                continue;
            }
            
            if (!in_array($roomId, $newRooms) && !empty($roomIp)) {
                if (strpos($roomIp, 'http://') !== 0 && strpos($roomIp, 'https://') !== 0) {
                    $roomIp = 'http://' . $roomIp;
                }
                
                $url = "{$roomIp}/clu_set1.cgi?box={$cardPos}&value=0";
                sendAsyncRequest($url, "Removed Room", $roomId, $cardPos, "0");
                $processedCount++;
                logMessage("Cleared previous room {$processedCount}: ID={$roomId}, card position {$cardPos} (database position {$roomPos}, card clears position " . ($cardPos + 1) . ")");
            }
        }
    }
    
    // Send PIN code to rooms
    if (!$accessAllRooms && !empty($rooms) && !empty($roomPositions)) {
        $roomIds = explode(',', $rooms);
        $roomPosArray = explode(',', $roomPositions);
        
        $roomsStmt = $pdo->prepare("SELECT id, ip_address FROM rooms WHERE id IN (" . implode(',', array_fill(0, count($roomIds), '?')) . ")");
        $roomsStmt->execute($roomIds);
        $roomsData = $roomsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        logMessage("Retrieved " . count($roomsData) . " room IPs for update");
        
        $roomIpMap = [];
        foreach ($roomsData as $room) {
            $roomIpMap[$room['id']] = $room['ip_address'];
            logMessage("Room ID={$room['id']} has IP={$room['ip_address']}");
        }
        
        for ($i = 0; $i < count($roomIds); $i++) {
            $roomId = $roomIds[$i];
            $roomPos = isset($roomPosArray[$i]) ? $roomPosArray[$i] : 1;
            // Subtract 1 to account for card's +1 adjustment
            $cardPos = (int)$roomPos - 1;
            $roomIp = isset($roomIpMap[$roomId]) ? $roomIpMap[$roomId] : '';
            
            if ($cardPos < 0) {
                logMessage("ERROR: Invalid card position {$cardPos} for room ID={$roomId}, database position={$roomPos}");
                continue;
            }
            
            if (!empty($roomIp)) {
                if (strpos($roomIp, 'http://') !== 0 && strpos($roomIp, 'https://') !== 0) {
                    $roomIp = 'http://' . $roomIp;
                }
                
                $url = "{$roomIp}/clu_set1.cgi?box={$cardPos}&value={$pinCode}";
                sendAsyncRequest($url, "Room", $roomId, $cardPos, $pinCode);
                logMessage("Set PIN code for room " . ($i + 1) . " of " . count($roomIds) . ": ID={$roomId}, card position {$cardPos} (database position {$roomPos}, card sets position " . ($cardPos + 1) . ")");
            } else {
                logMessage("ERROR: Missing IP for room ID={$roomId}");
            }
        }
    } elseif ($accessAllRooms) {
        $allRoomsStmt = $pdo->prepare("SELECT id, ip_address FROM rooms");
        $allRoomsStmt->execute();
        $allRooms = $allRoomsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        logMessage("Access all rooms: Retrieved " . count($allRooms) . " rooms for update");
        
        $processedCount = 0;
        foreach ($allRooms as $room) {
            $roomId = $room['id'];
            $roomIp = $room['ip_address'];
            $roomPos = 1;
            // Subtract 1 to account for card's +1 adjustment
            $cardPos = $roomPos - 1;
            
            if (!empty($roomIp)) {
                if (strpos($roomIp, 'http://') !== 0 && strpos($roomIp, 'https://') !== 0) {
                    $roomIp = 'http://' . $roomIp;
                }
                
                $url = "{$roomIp}/clu_set1.cgi?box={$cardPos}&value={$pinCode}";
                sendAsyncRequest($url, "All-Access Room", $roomId, $cardPos, $pinCode);
                $processedCount++;
                logMessage("Set PIN code for all-access room {$processedCount} of " . count($allRooms) . ": ID={$roomId}, card position {$cardPos} (database position {$roomPos}, card sets position " . ($cardPos + 1) . ")");
            } else {
                logMessage("ERROR: Missing IP for all-access room ID={$roomId}");
            }
        }
    }
    
    // Handle entry points similarly to rooms
    $prevEntryPoints = $prevStaffData['entry_points'] ? explode(',', $prevStaffData['entry_points']) : [];
    $prevEntryPos = $prevStaffData['entry_point_positions'] ? explode(',', $prevStaffData['entry_point_positions']) : [];
    $newEntryPoints = $entryPoints ? explode(',', $entryPoints) : [];
    
    // Clear PIN codes from entry points that are no longer accessible
    if (!empty($prevEntryPoints)) {
        $prevEntryStmt = $pdo->prepare("SELECT id, ip_address FROM entry_points WHERE id IN (" . implode(',', array_fill(0, count($prevEntryPoints), '?')) . ")");
        $prevEntryStmt->execute($prevEntryPoints);
        $prevEntryData = $prevEntryStmt->fetchAll(PDO::FETCH_ASSOC);
        
        logMessage("Retrieved " . count($prevEntryData) . " previously accessible entry points");
        
        $entryIpMap = [];
        foreach ($prevEntryData as $entry) {
            $entryIpMap[$entry['id']] = $entry['ip_address'];
            logMessage("Previous Entry Point ID={$entry['id']} has IP={$entry['ip_address']}");
        }
        
        $processedCount = 0;
        for ($i = 0; $i < count($prevEntryPoints); $i++) {
            $entryId = $prevEntryPoints[$i];
            $entryPos = isset($prevEntryPos[$i]) ? $prevEntryPos[$i] : 1;
            // Subtract 1 to account for card's +1 adjustment
            $cardPos = (int)$entryPos - 1;
            $entryIp = isset($entryIpMap[$entryId]) ? $entryIpMap[$entryId] : '';
            
            if ($cardPos < 0) {
                logMessage("ERROR: Invalid card position {$cardPos} for entry point ID={$entryId}, database position={$entryPos}");
                continue;
            }
            
            if (!in_array($entryId, $newEntryPoints) && !empty($entryIp)) {
                if (strpos($entryIp, 'http://') !== 0 && strpos($entryIp, 'https://') !== 0) {
                    $entryIp = 'http://' . $entryIp;
                }
                
                $url = "{$entryIp}/clu_set1.cgi?box={$cardPos}&value=0";
                sendAsyncRequest($url, "Removed Entry Point", $entryId, $cardPos, "0");
                $processedCount++;
                logMessage("Cleared previous entry point {$processedCount}: ID={$entryId}, card position {$cardPos} (database position {$entryPos}, card clears position " . ($cardPos + 1) . ")");
            }
        }
    }
    
    // Send PIN code to entry points
    if (!empty($entryPoints) && !empty($entryPointPositions)) {
        $entryPointIds = explode(',', $entryPoints);
        $entryPosArray = explode(',', $entryPointPositions);
        
        $entryStmt = $pdo->prepare("SELECT id, ip_address FROM entry_points WHERE id IN (" . implode(',', array_fill(0, count($entryPointIds), '?')) . ")");
        $entryStmt->execute($entryPointIds);
        $entryData = $entryStmt->fetchAll(PDO::FETCH_ASSOC);
        
        logMessage("Retrieved " . count($entryData) . " entry point IPs for update");
        
        $entryIpMap = [];
        foreach ($entryData as $entry) {
            $entryIpMap[$entry['id']] = $entry['ip_address'];
            logMessage("Entry Point ID={$entry['id']} has IP={$entry['ip_address']}");
        }
        
        for ($i = 0; $i < count($entryPointIds); $i++) {
            $entryId = $entryPointIds[$i];
            $entryPos = isset($entryPosArray[$i]) ? $entryPosArray[$i] : 1;
            // Subtract 1 to account for card's +1 adjustment
            $cardPos = (int)$entryPos - 1;
            $entryIp = isset($entryIpMap[$entryId]) ? $entryIpMap[$entryId] : '';
            
            if ($cardPos < 0) {
                logMessage("ERROR: Invalid card position {$cardPos} for entry point ID={$entryId}, database position={$entryPos}");
                continue;
            }
            
            if (!empty($entryIp)) {
                if (strpos($entryIp, 'http://') !== 0 && strpos($entryIp, 'https://') !== 0) {
                    $entryIp = 'http://' . $entryIp;
                }
                
                $url = "{$entryIp}/clu_set1.cgi?box={$cardPos}&value={$pinCode}";
                sendAsyncRequest($url, "Entry Point", $entryId, $cardPos, $pinCode);
                logMessage("Set PIN code for entry point " . ($i + 1) . " of " . count($entryPointIds) . ": ID={$entryId}, card position {$cardPos} (database position {$entryPos}, card sets position " . ($cardPos + 1) . ")");
            } else {
                logMessage("ERROR: Missing IP for entry point ID={$entryId}");
            }
        }
    }
    
    logMessage("=== STAFF UPDATE END ===");
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>