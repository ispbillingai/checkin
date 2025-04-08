
<?php
// Updated: Include your db_config.php from the php folder in the root directory
require_once __DIR__ . '/php/db_config.php';

/**
 * Simple function to log messages to codes.log in the same folder as this script.
 * It captures the date/time, then the message.
 */
function logMessage($message) {
    // Adjust path as needed; this will place codes.log in the same directory as the script
    $logFile = __DIR__ . '/codes.log';

    // Format the log line: [YYYY-mm-dd HH:MM:SS] <message>
    $time = date('Y-m-d H:i:s');
    $logLine = "[{$time}] {$message}\n";

    // Append to the log file
    file_put_contents($logFile, $logLine, FILE_APPEND);
}

// Define how to send HTTP GET requests in PHP
function sendGetRequest($url) {
    logMessage("Sending GET request to: {$url}");
    $result = @file_get_contents($url);
    if ($result === false) {
        logMessage("ERROR: Failed to get a response from {$url}");
        return null;
    }
    // Limit response log to 500 characters for brevity
    $respSnippet = substr($result, 0, 500);
    logMessage("Response from {$url}: {$respSnippet}");
    return $result;
}

try {
    logMessage("=== CRON START ===");

    // Find all bookings within the next hour that haven't been sent yet
    $sql = "
        SELECT b.*, r.ip_address AS room_ip
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        WHERE b.status = 'active'
          AND b.codes_sent = 0
          AND b.arrival_datetime > NOW()
          AND b.arrival_datetime <= DATE_ADD(NOW(), INTERVAL 1 HOUR)
    ";

    logMessage("Executing query to find upcoming bookings:\n{$sql}");
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    // Loop through each booking that needs codes
    while ($booking = $result->fetch_assoc()) {
        $bookingId     = $booking['id'];
        $roomId        = $booking['room_id'];
        $roomIp        = $booking['room_ip'];         // from the JOIN
        $roomPosition  = $booking['room_position'];   // int
        $pinCode       = $booking['access_code'];     // e.g. "00100"

        logMessage("Processing booking ID={$bookingId}, roomId={$roomId}, roomIp={$roomIp}, roomPos={$roomPosition}, pinCode={$pinCode}");

        // Send the code to the room if there's a valid room IP and position
        if (!empty($roomIp) && !empty($roomPosition)) {
            $url = "http://{$roomIp}/clu_set1.cgi?box={$roomPosition}&value={$pinCode}";
            sendGetRequest($url);
        } else {
            logMessage("Skipping room code send: Missing room IP or room position for booking ID={$bookingId}");
        }

        // Send codes to each entry point used by this booking
        $entryPointIds  = $booking['entry_point_id']; // e.g. "entry1,entry2,entry3"
        $entryPositions = $booking['positions'];      // e.g. "2,5,10"

        if (!empty($entryPointIds) && !empty($entryPositions)) {
            $entryPointsArray = explode(',', $entryPointIds);
            $positionsArray   = explode(',', $entryPositions);

            // We assume these arrays are the same length
            for ($i = 0; $i < count($entryPointsArray); $i++) {
                $epId = trim($entryPointsArray[$i]);   // e.g. "entry1"
                $pos  = trim($positionsArray[$i]);     // e.g. "5"

                logMessage(" Booking ID={$bookingId}: Attempting to send code to entry point ID={$epId} at position={$pos}");

                // Lookup that entry point's IP address from `entry_points`
                $stmtIp = $conn->prepare("SELECT ip_address FROM entry_points WHERE id = ? LIMIT 1");
                if (!$stmtIp) {
                    logMessage("ERROR: Could not prepare statement for IP lookup: " . $conn->error);
                    continue;
                }
                $stmtIp->bind_param("s", $epId);
                if (!$stmtIp->execute()) {
                    logMessage("ERROR: Could not execute IP lookup for {$epId}: " . $stmtIp->error);
                    continue;
                }
                $resIp = $stmtIp->get_result();
                $entryIp = '';
                if ($rowIp = $resIp->fetch_assoc()) {
                    $entryIp = $rowIp['ip_address'];
                }
                $stmtIp->close();

                if (empty($entryIp)) {
                    logMessage("No IP found for entry point ID={$epId}. Skipping.");
                    continue;
                }

                if (!empty($pos)) {
                    $url = "http://{$entryIp}/clu_set1.cgi?box={$pos}&value={$pinCode}";
                    sendGetRequest($url);
                } else {
                    logMessage("Skipping code send for booking ID={$bookingId}, epId={$epId}: position is empty.");
                }
            }
        } else {
            logMessage("No entry points or positions for booking ID={$bookingId}. Possibly none were selected.");
        }

        // Mark this booking's codes as sent so we don't send them again
        $updateSql = "UPDATE bookings SET codes_sent = 1 WHERE id = ?";
        $updateStmt = $conn->prepare($updateSql);
        if (!$updateStmt) {
            logMessage("ERROR: Could not prepare codes_sent update for booking ID={$bookingId}: " . $conn->error);
            continue;
        }
        $updateStmt->bind_param("i", $bookingId);
        if (!$updateStmt->execute()) {
            logMessage("ERROR: Could not update codes_sent for booking ID={$bookingId}: " . $updateStmt->error);
        } else {
            logMessage("Successfully marked codes_sent=1 for booking ID={$bookingId}");
        }
        $updateStmt->close();
    }

    $stmt->close();
    
    // NEW FUNCTIONALITY: Clear access codes an hour after checkout
    logMessage("=== STARTING CHECKOUT CLEANUP ===");
    
    // Find all bookings where checkout was an hour ago and codes haven't been cleared
    $clearSql = "
        SELECT b.*, r.ip_address AS room_ip  
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        WHERE b.status = 'completed'
          AND b.codes_cleared = 0
          AND b.departure_datetime < NOW() 
          AND b.departure_datetime >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    ";
    
    logMessage("Executing query to find recent checkouts:\n{$clearSql}");
    $clearStmt = $conn->prepare($clearSql);
    if (!$clearStmt) {
        throw new Exception("Failed to prepare checkout statement: " . $conn->error);
    }
    $clearStmt->execute();
    $clearResult = $clearStmt->get_result();
    
    // Loop through each booking that needs codes cleared
    while ($checkout = $clearResult->fetch_assoc()) {
        $bookingId = $checkout['id'];
        $roomId = $checkout['room_id'];
        $roomIp = $checkout['room_ip'];
        $roomPosition = $checkout['room_position'];
        
        logMessage("Clearing codes for completed booking ID={$bookingId}, roomId={$roomId}");
        
        // Clear the room code by setting value to 0
        if (!empty($roomIp) && !empty($roomPosition)) {
            $url = "http://{$roomIp}/clu_set1.cgi?box={$roomPosition}&value=0";
            sendGetRequest($url);
            logMessage("Cleared room code at roomIp={$roomIp}, position={$roomPosition}");
        } else {
            logMessage("Skipping room code clear: Missing room IP or position for booking ID={$bookingId}");
        }
        
        // Clear codes from each entry point used by this booking
        $entryPointIds = $checkout['entry_point_id'];
        $entryPositions = $checkout['positions'];
        
        if (!empty($entryPointIds) && !empty($entryPositions)) {
            $entryPointsArray = explode(',', $entryPointIds);
            $positionsArray = explode(',', $entryPositions);
            
            // Loop through each entry point
            for ($i = 0; $i < count($entryPointsArray); $i++) {
                $epId = trim($entryPointsArray[$i]);
                $pos = trim($positionsArray[$i]);
                
                logMessage("Booking ID={$bookingId}: Clearing code from entry point ID={$epId} at position={$pos}");
                
                // Get the entry point IP
                $epIpStmt = $conn->prepare("SELECT ip_address FROM entry_points WHERE id = ? LIMIT 1");
                if (!$epIpStmt) {
                    logMessage("ERROR: Could not prepare statement for entry point IP lookup: " . $conn->error);
                    continue;
                }
                $epIpStmt->bind_param("s", $epId);
                if (!$epIpStmt->execute()) {
                    logMessage("ERROR: Could not execute IP lookup for entry point {$epId}: " . $epIpStmt->error);
                    continue;
                }
                $epIpResult = $epIpStmt->get_result();
                $entryIp = '';
                if ($epIpRow = $epIpResult->fetch_assoc()) {
                    $entryIp = $epIpRow['ip_address'];
                }
                $epIpStmt->close();
                
                if (empty($entryIp)) {
                    logMessage("No IP found for entry point ID={$epId}. Skipping code clearing.");
                    continue;
                }
                
                if (!empty($pos)) {
                    // Clear the code by setting value to 0
                    $url = "http://{$entryIp}/clu_set1.cgi?box={$pos}&value=0";
                    sendGetRequest($url);
                    logMessage("Cleared entry point code at entryIp={$entryIp}, position={$pos}");
                } else {
                    logMessage("Skipping code clear for booking ID={$bookingId}, epId={$epId}: position is empty.");
                }
            }
        } else {
            logMessage("No entry points or positions for booking ID={$bookingId}. Skipping entry code clearing.");
        }
        
        // Mark this booking's codes as cleared
        $updateClearSql = "UPDATE bookings SET codes_cleared = 1 WHERE id = ?";
        $updateClearStmt = $conn->prepare($updateClearSql);
        if (!$updateClearStmt) {
            logMessage("ERROR: Could not prepare codes_cleared update for booking ID={$bookingId}: " . $conn->error);
            continue;
        }
        $updateClearStmt->bind_param("i", $bookingId);
        if (!$updateClearStmt->execute()) {
            logMessage("ERROR: Could not update codes_cleared for booking ID={$bookingId}: " . $updateClearStmt->error);
        } else {
            logMessage("Successfully marked codes_cleared=1 for booking ID={$bookingId}");
        }
        $updateClearStmt->close();
    }
    
    $clearStmt->close();
    logMessage("Checkout cleanup completed successfully.");
    logMessage("=== CRON END ===\n");

} catch (Exception $e) {
    $errorMsg = "Error in cron script: " . $e->getMessage();
    logMessage($errorMsg);
    echo $errorMsg . "\n";
}
