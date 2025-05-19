<?php
// Include database configuration
require_once __DIR__ . '/php/db_config.php';

// Set PHP timezone to match server (CEST, UTC+2)
date_default_timezone_set('Europe/Paris'); // CEST

// Set database session timezone to CEST
$conn->query("SET time_zone = '+02:00'");

// Define how to send HTTP GET requests
function sendGetRequest($url, $deviceType, $deviceId, $position, $pinCode) {
    // Ensure URL has a valid protocol
    if (!preg_match('#^https?://#', $url)) {
        $url = 'http://' . $url;
    }
    error_log("Sending GET request to: {$url}, Device={$deviceType}, ID={$deviceId}, Position={$position}, PIN={$pinCode}");
    $opts = [
        'http' => [
            'timeout' => 0.5,
            'ignore_errors' => true,
            'header' => "Connection: Close\r\n"
        ]
    ];
    $context = stream_context_create($opts);
    $result = @file_get_contents($url, false, $context);
    if ($result === false) {
        error_log("ERROR: Failed to get a response from {$url}");
        return false;
    }
    // Limit response log to 500 characters for brevity
    $respSnippet = substr($result, 0, 500);
    error_log("Response from {$url}: {$respSnippet}");
    return true;
}

try {
    error_log("=== CRON START ===");
    error_log("PHP timezone: " . date_default_timezone_get());
    error_log("Database NOW(): " . $conn->query("SELECT NOW() AS now")->fetch_assoc()['now']);

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

    error_log("Executing query to find upcoming bookings:\n{$sql}");
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    // Loop through each booking that needs codes (insertion)
    while ($booking = $result->fetch_assoc()) {
        $bookingId     = $booking['id'];
        $roomId        = $booking['room_id'];
        $roomIp        = $booking['room_ip'];
        $roomPosition  = $booking['room_position'];
        $pinCode       = $booking['access_code'];
        $entryPointIds = $booking['entry_point_id'];
        $entryPositions = $booking['positions'];

        error_log("Processing booking ID={$bookingId}, roomId={$roomId}, roomIp={$roomIp}, roomPos={$roomPosition}, pinCode={$pinCode}");

        // Validate PIN code
        if (empty($pinCode) || strlen($pinCode) > 15) {
            error_log("ERROR: Invalid PIN code for booking ID={$bookingId}: " . ($pinCode ?: 'empty'));
            continue;
        }

        $allRequestsSuccessful = true;

        // Send the code to the room (set value to PIN code)
        if (!empty($roomIp) && !empty($roomPosition)) {
            // Subtract 1 to account for card's +1 adjustment
            $cardPos = (int)$roomPosition - 1;
            if ($cardPos < 0) {
                error_log("ERROR: Invalid card position {$cardPos} for booking ID={$bookingId}, room ID={$roomId}, database position={$roomPosition}");
                $allRequestsSuccessful = false;
            } else {
                $url = "http://{$roomIp}/clu_set1.cgi?box={$cardPos}&value={$pinCode}";
                if (!sendGetRequest($url, "Room", $roomId, $cardPos, $pinCode)) {
                    $allRequestsSuccessful = false;
                } else {
                    error_log("Set room code for booking ID={$bookingId} at roomIp={$roomIp}, card position {$cardPos} (database position {$roomPosition}, card sets position " . ($cardPos + 1) . ") to {$pinCode}");
                }
            }
        } else {
            error_log("Skipping room code send: Missing room IP or room position for booking ID={$bookingId}");
            $allRequestsSuccessful = false;
        }

        // Send codes to each entry point
        if (!empty($entryPointIds) && !empty($entryPositions)) {
            $entryPointsArray = explode(',', $entryPointIds);
            $positionsArray   = explode(',', $entryPositions);

            // Validate array lengths
            if (count($entryPointsArray) !== count($positionsArray)) {
                error_log("ERROR: Mismatch in entry points and positions for booking ID={$bookingId}: entryPoints=" . count($entryPointsArray) . ", positions=" . count($positionsArray));
                $allRequestsSuccessful = false;
                continue;
            }

            for ($i = 0; $i < count($entryPointsArray); $i++) {
                $epId = trim($entryPointsArray[$i]);
                $pos  = trim($positionsArray[$i]);

                error_log("Booking ID={$bookingId}: Attempting to send code to entry point ID={$epId} at position={$pos}");

                // Lookup entry point's IP address
                $stmtIp = $conn->prepare("SELECT ip_address FROM entry_points WHERE id = ? LIMIT 1");
                if (!$stmtIp) {
                    error_log("ERROR: Could not prepare statement for IP lookup: " . $conn->error);
                    $allRequestsSuccessful = false;
                    continue;
                }
                $stmtIp->bind_param("s", $epId);
                if (!$stmtIp->execute()) {
                    error_log("ERROR: Could not execute IP lookup for {$epId}: " . $stmtIp->error);
                    $allRequestsSuccessful = false;
                    continue;
                }
                $resIp = $stmtIp->get_result();
                $entryIp = '';
                if ($rowIp = $resIp->fetch_assoc()) {
                    $entryIp = $rowIp['ip_address'];
                }
                $stmtIp->close();

                if (empty($entryIp)) {
                    error_log("No IP found for entry point ID={$epId}. Skipping.");
                    $allRequestsSuccessful = false;
                    continue;
                }

                if (!empty($pos)) {
                    // Subtract 1 to account for card's +1 adjustment
                    $cardPos = (int)$pos - 1;
                    if ($cardPos < 0) {
                        error_log("ERROR: Invalid card position {$cardPos} for booking ID={$bookingId}, entry point ID={$epId}, database position={$pos}");
                        $allRequestsSuccessful = false;
                    } else {
                        $url = "http://{$entryIp}/clu_set1.cgi?box={$cardPos}&value={$pinCode}";
                        if (!sendGetRequest($url, "Entry Point", $epId, $cardPos, $pinCode)) {
                            $allRequestsSuccessful = false;
                        } else {
                            error_log("Set entry point code for booking ID={$bookingId} at entry point ID={$epId}, card position {$cardPos} (database position {$pos}, card sets position " . ($cardPos + 1) . ") to {$pinCode}");
                        }
                    }
                } else {
                    error_log("Skipping code send for booking ID={$bookingId}, epId={$epId}: position is empty.");
                    $allRequestsSuccessful = false;
                }
            }
        } else {
            error_log("No entry points or positions for booking ID={$bookingId}. Possibly none were selected.");
        }

        // Mark codes as sent only if all requests succeeded
        if ($allRequestsSuccessful) {
            $updateSql = "UPDATE bookings SET codes_sent = 1 WHERE id = ?";
            $updateStmt = $conn->prepare($updateSql);
            if (!$updateStmt) {
                error_log("ERROR: Could not prepare codes_sent update for booking ID={$bookingId}: " . $conn->error);
                continue;
            }
            $updateStmt->bind_param("i", $bookingId);
            if (!$updateStmt->execute()) {
                error_log("ERROR: Could not update codes_sent for booking ID={$bookingId}: " . $updateStmt->error);
            } else {
                error_log("Successfully marked codes_sent=1 for booking ID={$bookingId}");
            }
            $updateStmt->close();
        } else {
            error_log("Not marking codes_sent for booking ID={$bookingId}: Some requests failed");
        }
    }

    $stmt->close();
    
    // Clear access codes an hour after checkout (set value to 0)
    error_log("=== STARTING CHECKOUT CLEANUP ===");
    
    // Find all bookings where checkout was up to an hour ago and codes haven't been cleared
    $clearSql = "
        SELECT b.*, r.ip_address AS room_ip  
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        WHERE b.codes_cleared = 0
          AND b.departure_datetime <= NOW()
          AND b.departure_datetime >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    ";
    
    error_log("Executing query to find recent checkouts:\n{$clearSql}");
    $clearStmt = $conn->prepare($clearSql);
    if (!$clearStmt) {
        throw new Exception("Failed to prepare checkout statement: " . $conn->error);
    }
    $clearStmt->execute();
    $clearResult = $clearStmt->get_result();
    
    // Current time for logging
    $currentTime = date('Y-m-d H:i:s');
    error_log("Current server time: {$currentTime}");
    error_log("Found " . $clearResult->num_rows . " bookings for cleanup");
    
    // Loop through each booking that needs codes cleared
    while ($checkout = $clearResult->fetch_assoc()) {
        $bookingId = $checkout['id'];
        $roomId = $checkout['room_id'];
        $roomIp = $checkout['room_ip'];
        $roomPosition = $checkout['room_position'];
        $entryPointIds = $checkout['entry_point_id'];
        $entryPositions = $checkout['positions'];
        $departureTime = $checkout['departure_datetime'];
        $status = $checkout['status'];
        
        error_log("Processing checkout for booking ID={$bookingId}, roomId={$roomId}, status={$status}, departure_datetime={$departureTime}");
        
        // Calculate time difference to check 1-hour window
        $currentTimestamp = strtotime($currentTime);
        $departureTimestamp = strtotime($departureTime);
        $timeDiffMinutes = ($currentTimestamp - $departureTimestamp) / 60;
        if ($timeDiffMinutes < 0) {
            error_log("Booking ID={$bookingId} not yet eligible for cleanup: departure_datetime={$departureTime} is in the future (current time={$currentTime})");
            continue;
        } elseif ($timeDiffMinutes > 60) {
            error_log("Booking ID={$bookingId} outside 1-hour window: departure_datetime={$departureTime} is {$timeDiffMinutes} minutes ago");
            continue;
        } else {
            error_log("Booking ID={$bookingId} within 1-hour window: departure_datetime={$departureTime}, {$timeDiffMinutes} minutes ago");
        }
        
        $allClearRequestsSuccessful = true;

        // Clear the room code by setting value to 0
        if (!empty($roomIp) && !empty($roomPosition)) {
            // Subtract 1 to account for card's +1 adjustment
            $cardPos = (int)$roomPosition - 1;
            if ($cardPos < 0) {
                error_log("ERROR: Invalid card position {$cardPos} for booking ID={$bookingId}, room ID={$roomId}, database position={$roomPosition}");
                $allClearRequestsSuccessful = false;
            } else {
                $url = "http://{$roomIp}/clu_set1.cgi?box={$cardPos}&value=0";
                if (!sendGetRequest($url, "Room", $roomId, $cardPos, "0")) {
                    error_log("Failed to clear room code for booking ID={$bookingId} at roomIp={$roomIp}, card position {$cardPos} (database position {$roomPosition})");
                    $allClearRequestsSuccessful = false;
                } else {
                    error_log("Successfully cleared room code for booking ID={$bookingId} at roomIp={$roomIp}, card position {$cardPos} (database position {$roomPosition}, card clears position " . ($cardPos + 1) . ")");
                }
            }
        } else {
            error_log("Skipping room code clear for booking ID={$bookingId}: " . (empty($roomIp) ? "Missing room IP" : "") . (empty($roomPosition) ? " Missing room position" : ""));
            $allClearRequestsSuccessful = false;
        }
        
        // Clear codes from each entry point
        if (!empty($entryPointIds) && !empty($entryPositions)) {
            $entryPointsArray = explode(',', $entryPointIds);
            $positionsArray = explode(',', $entryPositions);
            
            // Validate array lengths
            if (count($entryPointsArray) !== count($positionsArray)) {
                error_log("ERROR: Mismatch in entry points and positions for booking ID={$bookingId}: entryPoints=" . count($entryPointsArray) . ", positions=" . count($positionsArray));
                $allClearRequestsSuccessful = false;
                continue;
            }
            
            error_log("Processing " . count($entryPointsArray) . " entry points for booking ID={$bookingId}");
            
            for ($i = 0; $i < count($entryPointsArray); $i++) {
                $epId = trim($entryPointsArray[$i]);
                $pos = trim($positionsArray[$i]);
                
                error_log("Booking ID={$bookingId}: Attempting to clear code from entry point ID={$epId} at position={$pos}");
                
                // Get the entry point IP
                $epIpStmt = $conn->prepare("SELECT ip_address FROM entry_points WHERE id = ? LIMIT 1");
                if (!$epIpStmt) {
                    error_log("ERROR: Could not prepare statement for entry point IP lookup for epId={$epId}: " . $conn->error);
                    $allClearRequestsSuccessful = false;
                    continue;
                }
                $epIpStmt->bind_param("s", $epId);
                if (!$epIpStmt->execute()) {
                    error_log("ERROR: Could not execute IP lookup for entry point epId={$epId}: " . $epIpStmt->error);
                    $allClearRequestsSuccessful = false;
                    continue;
                }
                $epIpResult = $epIpStmt->get_result();
                $entryIp = '';
                if ($epIpRow = $epIpResult->fetch_assoc()) {
                    $entryIp = $epIpRow['ip_address'];
                } else {
                    error_log("No IP found for entry point ID={$epId} for booking ID={$bookingId}. Skipping code clearing.");
                    $allClearRequestsSuccessful = false;
                    continue;
                }
                $epIpStmt->close();
                
                if (empty($entryIp)) {
                    error_log("Empty IP address for entry point ID={$epId} for booking ID={$bookingId}. Skipping code clearing.");
                    $allClearRequestsSuccessful = false;
                    continue;
                }
                
                if (!empty($pos)) {
                    // Subtract 1 to account for card's +1 adjustment
                    $cardPos = (int)$pos - 1;
                    if ($cardPos < 0) {
                        error_log("ERROR: Invalid card position {$cardPos} for booking ID={$bookingId}, entry point ID={$epId}, database position={$pos}");
                        $allClearRequestsSuccessful = false;
                    } else {
                        $url = "http://{$entryIp}/clu_set1.cgi?box={$cardPos}&value=0";
                        if (!sendGetRequest($url, "Entry Point", $epId, $cardPos, "0")) {
                            error_log("Failed to clear entry point code for booking ID={$bookingId} at entryIp={$entryIp}, card position {$cardPos} (database position {$pos})");
                            $allClearRequestsSuccessful = false;
                        } else {
                            error_log("Successfully cleared entry point code for booking ID={$bookingId} at entryIp={$entryIp}, card position {$cardPos} (database position {$pos}, card clears position " . ($cardPos + 1) . ")");
                        }
                    }
                } else {
                    error_log("Skipping code clear for booking ID={$bookingId}, epId={$epId}: position is empty.");
                    $allClearRequestsSuccessful = false;
                }
            }
        } else {
            error_log("No entry points or positions for booking ID={$bookingId}. Skipping entry code clearing.");
        }
        
        // Mark codes as cleared only if all requests succeeded
        if ($allClearRequestsSuccessful) {
            $updateClearSql = "UPDATE bookings SET codes_cleared = 1 WHERE id = ?";
            $updateClearStmt = $conn->prepare($updateClearSql);
            if (!$updateClearStmt) {
                error_log("ERROR: Could not prepare codes_cleared update for booking ID={$bookingId}: " . $conn->error);
                continue;
            }
            $updateClearStmt->bind_param("i", $bookingId);
            if (!$updateClearStmt->execute()) {
                error_log("ERROR: Could not update codes_cleared for booking ID={$bookingId}: " . $updateClearStmt->error);
            } else {
                error_log("Successfully marked codes_cleared=1 for booking ID={$bookingId}");
            }
            $updateClearStmt->close();
        } else {
            error_log("Not marking codes_cleared for booking ID={$bookingId}: Some clear requests failed or were skipped");
        }
    }
    
    $clearStmt->close();
    error_log("Checkout cleanup completed successfully.");
    error_log("=== CRON END ===\n");

} catch (Exception $e) {
    $errorMsg = "Error in cron script: " . $e->getMessage();
    error_log($errorMsg);
    echo $errorMsg . "\n";
}
?>