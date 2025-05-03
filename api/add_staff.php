
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
        
        // Log retrieved room IPs for debugging
        logMessage("Retrieved " . count($roomsData) . " room IPs for staff " . $staffId);
        
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
                logMessage("Room {$i+1} of " . count($roomIds) . " processed");
            } else {
                logMessage("ERROR: Missing IP for room ID={$roomId}");
            }
        }
    } elseif ($accessAllRooms) {
        // If staff has access to all rooms, get all rooms and set PIN code
        $allRoomsStmt = $pdo->prepare("SELECT id, ip_address FROM rooms");
        $allRoomsStmt->execute();
        $allRooms = $allRoomsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        logMessage("Access all rooms: Retrieved " . count($allRooms) . " rooms");
        
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
                logMessage("All-access room {$processedCount} of " . count($allRooms) . " processed");
            } else {
                logMessage("ERROR: Missing IP for all-access room ID={$roomId}");
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
        
        // Log retrieved entry point IPs for debugging
        logMessage("Retrieved " . count($entryData) . " entry point IPs for staff " . $staffId);
        
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
                logMessage("Entry point {$i+1} of " . count($entryPointIds) . " processed");
            } else {
                logMessage("ERROR: Missing IP for entry point ID={$entryId}");
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
