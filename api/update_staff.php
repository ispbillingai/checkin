
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

// Enhanced function to send HTTP requests with better handling for multiple requests
function sendAsyncRequest($url, $deviceType, $deviceId, $position, $pinCode) {
    // Log detailed information about the request
    logMessage("SENDING PIN: Device={$deviceType}, ID={$deviceId}, Position={$position}, PIN={$pinCode}");
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
        logMessage("PIN CODE SENT: Request initiated to {$deviceType} ID={$deviceId}, Position={$position}");
        
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
    
    // If access was changed from "all rooms" to specific rooms, we need to clear all room access
    if ($wasAllRooms && !$nowAllRooms) {
        // Get all rooms and clear PIN codes
        $allRoomsStmt = $pdo->prepare("SELECT id, ip_address FROM rooms");
        $allRoomsStmt->execute();
        $allRooms = $allRoomsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        logMessage("Clearing PIN codes from all rooms due to access change (was all, now specific)");
        
        $processedCount = 0;
        foreach ($allRooms as $room) {
            $roomId = $room['id'];
            $roomIp = $room['ip_address'];
            // Use position 1 as default for "all rooms" access
            $roomPos = 1;
            
            if (!empty($roomIp) && !in_array($roomId, $newRooms)) {
                // Ensure IP address has http:// prefix
                if (strpos($roomIp, 'http://') !== 0 && strpos($roomIp, 'https://') !== 0) {
                    $roomIp = 'http://' . $roomIp;
                }
                
                $url = $roomIp . "/clu_set1.cgi?box={$roomPos}&value=0";
                sendAsyncRequest($url, "Ex-All-Access Room", $roomId, $roomPos, "0");
                $processedCount++;
                logMessage("Cleared all-access room {$processedCount}: ID={$roomId}");
            }
        }
    }
    
    // Clear PIN codes from rooms that are no longer accessible
    if (!$nowAllRooms && !empty($prevRooms)) {
        // Get all previously accessible room IPs in one query
        $prevRoomsStmt = $pdo->prepare("SELECT id, ip_address FROM rooms WHERE id IN (" . implode(',', array_fill(0, count($prevRooms), '?')) . ")");
        $prevRoomsStmt->execute($prevRooms);
        $prevRoomsData = $prevRoomsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        logMessage("Retrieved " . count($prevRoomsData) . " previously accessible room IPs");
        
        // Map room IDs to their IPs for easy lookup
        $roomIpMap = [];
        foreach ($prevRoomsData as $room) {
            $roomIpMap[$room['id']] = $room['ip_address'];
            logMessage("Previous Room ID={$room['id']} has IP={$room['ip_address']}");
        }
        
        $processedCount = 0;
        // Loop through each previously accessible room
        for ($i = 0; $i < count($prevRooms); $i++) {
            $roomId = $prevRooms[$i];
            $roomPos = isset($prevRoomPos[$i]) ? $prevRoomPos[$i] : 1;
            $roomIp = isset($roomIpMap[$roomId]) ? $roomIpMap[$roomId] : '';
            
            // If this room is no longer in the list, clear its code
            if (!in_array($roomId, $newRooms) && !empty($roomIp)) {
                // Ensure IP address has http:// prefix
                if (strpos($roomIp, 'http://') !== 0 && strpos($roomIp, 'https://') !== 0) {
                    $roomIp = 'http://' . $roomIp;
                }
                
                $url = $roomIp . "/clu_set1.cgi?box={$roomPos}&value=0";
                sendAsyncRequest($url, "Removed Room", $roomId, $roomPos, "0");
                $processedCount++;
                logMessage("Cleared previous room {$processedCount}: ID={$roomId}, position={$roomPos}");
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
        
        logMessage("Retrieved " . count($roomsData) . " room IPs for update");
        
        // Map room IDs to their IPs for easy lookup
        $roomIpMap = [];
        foreach ($roomsData as $room) {
            $roomIpMap[$room['id']] = $room['ip_address'];
            logMessage("Room ID={$room['id']} has IP={$room['ip_address']}");
        }
        
        // Loop through each room and send PIN code
        for ($i = 0; $i < count($roomIds); $i++) {
            $roomId = $roomIds[$i];
            $roomPos = isset($roomPosArray[$i]) ? $roomPosArray[$i] : 1;
            $roomIp = isset($roomIpMap[$roomId]) ? $roomIpMap[$roomId] : '';
            
            if (!empty($roomIp)) {
                // Ensure IP address has http:// prefix
                if (strpos($roomIp, 'http://') !== 0 && strpos($roomIp, 'https://') !== 0) {
                    $roomIp = 'http://' . $roomIp;
                }
                
                $url = $roomIp . "/clu_set1.cgi?box={$roomPos}&value={$pinCode}";
                sendAsyncRequest($url, "Room", $roomId, $roomPos, $pinCode);

            } else {
                logMessage("ERROR: Missing IP for room ID={$roomId}");
            }
        }
    } elseif ($accessAllRooms) {
        // If staff has access to all rooms, get all rooms and set PIN code
        $allRoomsStmt = $pdo->prepare("SELECT id, ip_address FROM rooms");
        $allRoomsStmt->execute();
        $allRooms = $allRoomsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        logMessage("Access all rooms: Retrieved " . count($allRooms) . " rooms for update");
        
        $processedCount = 0;
        foreach ($allRooms as $room) {
            $roomId = $room['id'];
            $roomIp = $room['ip_address'];
            // Use position 1 as default for "all rooms" access
            $roomPos = 1;
            
            if (!empty($roomIp)) {
                // Ensure IP address has http:// prefix
                if (strpos($roomIp, 'http://') !== 0 && strpos($roomIp, 'https://') !== 0) {
                    $roomIp = 'http://' . $roomIp;
                }
                
                $url = $roomIp . "/clu_set1.cgi?box={$roomPos}&value={$pinCode}";
                sendAsyncRequest($url, "All-Access Room", $roomId, $roomPos, $pinCode);
                $processedCount++;
                logMessage("All-access room {$processedCount} of " . count($allRooms) . " updated: ID={$roomId}");
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
        // Get all previously accessible entry point IPs in one query
        $prevEntryStmt = $pdo->prepare("SELECT id, ip_address FROM entry_points WHERE id IN (" . implode(',', array_fill(0, count($prevEntryPoints), '?')) . ")");
        $prevEntryStmt->execute($prevEntryPoints);
        $prevEntryData = $prevEntryStmt->fetchAll(PDO::FETCH_ASSOC);
        
        logMessage("Retrieved " . count($prevEntryData) . " previously accessible entry points");
        
        // Map entry point IDs to their IPs for easy lookup
        $entryIpMap = [];
        foreach ($prevEntryData as $entry) {
            $entryIpMap[$entry['id']] = $entry['ip_address'];
            logMessage("Previous Entry Point ID={$entry['id']} has IP={$entry['ip_address']}");
        }
        
        $processedCount = 0;
        // Loop through each previously accessible entry point
        for ($i = 0; $i < count($prevEntryPoints); $i++) {
            $entryId = $prevEntryPoints[$i];
            $entryPos = isset($prevEntryPos[$i]) ? $prevEntryPos[$i] : 1;
            $entryIp = isset($entryIpMap[$entryId]) ? $entryIpMap[$entryId] : '';
            
            // If this entry point is no longer in the list, clear its code
            if (!in_array($entryId, $newEntryPoints) && !empty($entryIp)) {
                // Ensure IP address has http:// prefix
                if (strpos($entryIp, 'http://') !== 0 && strpos($entryIp, 'https://') !== 0) {
                    $entryIp = 'http://' . $entryIp;
                }
                
                $url = $entryIp . "/clu_set1.cgi?box={$entryPos}&value=0";
                sendAsyncRequest($url, "Removed Entry Point", $entryId, $entryPos, "0");
                $processedCount++;
                logMessage("Cleared previous entry point {$processedCount}: ID={$entryId}, position={$entryPos}");
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
        
        logMessage("Retrieved " . count($entryData) . " entry point IPs for update");
        
        // Map entry point IDs to their IPs for easy lookup
        $entryIpMap = [];
        foreach ($entryData as $entry) {
            $entryIpMap[$entry['id']] = $entry['ip_address'];
            logMessage("Entry Point ID={$entry['id']} has IP={$entry['ip_address']}");
        }
        
        // Loop through each entry point and send PIN code
        for ($i = 0; $i < count($entryPointIds); $i++) {
            $entryId = $entryPointIds[$i];
            $entryPos = isset($entryPosArray[$i]) ? $entryPosArray[$i] : 1;
            $entryIp = isset($entryIpMap[$entryId]) ? $entryIpMap[$entryId] : '';
            
            if (!empty($entryIp)) {
                // Ensure IP address has http:// prefix
                if (strpos($entryIp, 'http://') !== 0 && strpos($entryIp, 'https://') !== 0) {
                    $entryIp = 'http://' . $entryIp;
                }
                
                $url = $entryIp . "/clu_set1.cgi?box={$entryPos}&value={$pinCode}";
                sendAsyncRequest($url, "Entry Point", $entryId, $entryPos, $pinCode);

            } else {
                logMessage("ERROR: Missing IP for entry point ID={$entryId}");
            }
        }
    }
    
    logMessage("=== STAFF UPDATE END ===");
    
} catch (PDOException $e) {
    // Log error and return error response
    error_log("Database error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
