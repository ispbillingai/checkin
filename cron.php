<?php
// Include database configuration
require_once __DIR__ . '/php/db_config.php';

// Set PHP timezone to match server (CEST, UTC+2)
date_default_timezone_set('Europe/Paris'); // CEST

// Function to send HTTP GET requests with enhanced logging
function sendGetRequest($url, $deviceType, $deviceId, $position, $pinCode) {
    // Ensure URL has a valid protocol
    if (!preg_match('#^https?://#', $url)) {
        $url = 'http://' . $url;
    }
    error_log("Sending GET request: URL={$url}, Device={$deviceType}, ID={$deviceId}, Position={$position}, PIN={$pinCode}");
    
    // Validate URL format
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        error_log("ERROR: Invalid URL format: {$url}");
        return false;
    }
    
    $opts = [
        'http' => [
            'timeout' => 1.0, // Increased timeout for reliability
            'ignore_errors' => true,
            'header' => "Connection: Close\r\n"
        ]
    ];
    $context = stream_context_create($opts);
    
    try {
        $startTime = microtime(true);
        $result = @file_get_contents($url, false, $context);
        $duration = microtime(true) - $startTime;
        if ($result === false) {
            error_log("ERROR: Failed to get a response from {$url} after {$duration} seconds");
            return false;
        }
        $respSnippet = substr($result, 0, 500);
        error_log("Response from {$url} (took {$duration} seconds): {$respSnippet}");
        return true;
    } catch (Exception $e) {
        error_log("ERROR: Exception in sendGetRequest: {$e->getMessage()}");
        return false;
    }
}

try {
    error_log("=== CRON START ===");
    $currentTime = date('Y-m-d H:i:s');
    error_log("PHP timezone: " . date_default_timezone_get());
    error_log("Server time: {$currentTime}");
    
    // Connect to database using PDO
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Set database timezone
    $pdo->query("SET time_zone = '+02:00'");
    $dbTimeStmt = $pdo->query("SELECT NOW() AS now");
    $dbTime = $dbTimeStmt->fetch(PDO::FETCH_ASSOC)['now'];
    error_log("Database NOW(): {$dbTime}");
    
    // Log database schema assumptions
    error_log("Assuming schema: bookings (id, room_id, status, codes_sent, codes_cleared, arrival_datetime, departure_datetime, access_code, room_position, entry_point_id, positions)");
    error_log("Assuming schema: rooms (id, ip_address)");
    error_log("Assuming schema: entry_points (id, ip_address)");
    
    // Log all bookings to diagnose eligibility
    $allBookingsSql = "
        SELECT id, room_id, status, codes_sent, arrival_datetime, departure_datetime, access_code, room_position, entry_point_id, positions
        FROM bookings
        ORDER BY arrival_datetime
    ";
    error_log("Executing query to log all bookings:\n{$allBookingsSql}");
    $allBookingsStmt = $pdo->query($allBookingsSql);
    $allBookings = $allBookingsStmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("Found " . count($allBookings) . " total bookings in database");
    
    foreach ($allBookings as $booking) {
        $isEligible = (
            $booking['status'] === 'active' &&
            $booking['codes_sent'] == 0 &&
            strtotime($booking['arrival_datetime']) > strtotime($dbTime) &&
            strtotime($booking['arrival_datetime']) <= strtotime($dbTime . ' +1 hour')
        );
        error_log(
            "Booking ID={$booking['id']}: " .
            "room_id={$booking['room_id']}, " .
            "status={$booking['status']}, " .
            "codes_sent={$booking['codes_sent']}, " .
            "arrival_datetime={$booking['arrival_datetime']}, " .
            "departure_datetime={$booking['departure_datetime']}, " .
            "access_code=" . ($booking['access_code'] ?: 'empty') . ", " .
            "room_position=" . ($booking['room_position'] ?: 'empty') . ", " .
            "entry_point_id=" . ($booking['entry_point_id'] ?: 'empty') . ", " .
            "positions=" . ($booking['positions'] ?: 'empty') . ", " .
            "EligibleForSending=" . ($isEligible ? 'Yes' : 'No')
        );
        if (!$isEligible) {
            $reasons = [];
            if ($booking['status'] !== 'active') $reasons[] = "Status is not active ({$booking['status']})";
            if ($booking['codes_sent'] != 0) $reasons[] = "Codes already sent (codes_sent={$booking['codes_sent']})";
            if (strtotime($booking['arrival_datetime']) <= strtotime($dbTime)) $reasons[] = "Arrival time is not in the future (arrival_datetime={$booking['arrival_datetime']})";
            if (strtotime($booking['arrival_datetime']) > strtotime($dbTime . ' +1 hour')) $reasons[] = "Arrival time is more than 1 hour away (arrival_datetime={$booking['arrival_datetime']})";
            error_log("Booking ID={$booking['id']} not eligible for sending because: " . implode(', ', $reasons));
        }
    }
    
    // Find bookings within the next hour that haven't had codes sent
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
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("Found " . count($bookings) . " eligible bookings for code sending");
    
    // Process each booking for sending codes
    foreach ($bookings as $booking) {
        $bookingId = $booking['id'];
        $roomId = $booking['room_id'];
        $roomIp = $booking['room_ip'];
        $roomPosition = $booking['room_position'];
        $pinCode = $booking['access_code'];
        $entryPointIds = $booking['entry_point_id'];
        $entryPositions = $booking['positions'];
        
        error_log(
            "Processing booking for code sending: " .
            "ID={$bookingId}, roomId={$roomId}, roomIp={$roomIp}, " .
            "roomPosition={$roomPosition}, pinCode={$pinCode}, " .
            "entryPointIds={$entryPointIds}, entryPositions={$entryPositions}"
        );
        
        // Validate PIN code
        if (empty($pinCode) || strlen($pinCode) > 15) {
            error_log("ERROR: Invalid PIN code for booking ID={$bookingId}: " . ($pinCode ?: 'empty'));
            continue;
        }
        
        $allRequestsSuccessful = true;
        
        // Send code to room
        if (!empty($roomIp) && !empty($roomPosition)) {
            $cardPos = (int)$roomPosition - 1;
            if ($cardPos < 0) {
                error_log("ERROR: Invalid card position {$cardPos} for booking ID={$bookingId}, room ID={$roomId}, database position={$roomPosition}");
                $allRequestsSuccessful = false;
            } else {
                $url = "http://{$roomIp}/clu_set1.cgi?box={$cardPos}&value={$pinCode}";
                error_log("Attempting to send room code: URL={$url}");
                if (!sendGetRequest($url, "Room", $roomId, $cardPos, $pinCode)) {
                    $allRequestsSuccessful = false;
                } else {
                    error_log("Successfully set room code for booking ID={$bookingId} at roomIp={$roomIp}, card position {$cardPos} (database position {$roomPosition}, card sets position " . ($cardPos + 1) . ") to {$pinCode}");
                }
            }
        } else {
            error_log("Skipping room code send for booking ID={$bookingId}: " . (empty($roomIp) ? "Missing room IP" : "") . (empty($roomPosition) ? " Missing room position" : ""));
            $allRequestsSuccessful = false;
        }
        
        // Send codes to entry points
        if (!empty($entryPointIds) && !empty($entryPositions)) {
            $entryPointsArray = explode(',', $entryPointIds);
            $positionsArray = explode(',', $entryPositions);
            
            if (count($entryPointsArray) !== count($positionsArray)) {
                error_log("ERROR: Mismatch in entry points and positions for booking ID={$bookingId}: entryPoints=" . count($entryPointsArray) . ", positions=" . count($positionsArray));
                $allRequestsSuccessful = false;
                continue;
            }
            
            error_log("Processing " . count($entryPointsArray) . " entry points for booking ID={$bookingId}");
            
            for ($i = 0; $i < count($entryPointsArray); $i++) {
                $epId = trim($entryPointsArray[$i]);
                $pos = trim($positionsArray[$i]);
                
                error_log("Booking ID={$bookingId}: Attempting to send code to entry point ID={$epId} at position={$pos}");
                
                // Lookup entry point IP
                $stmtIp = $pdo->prepare("SELECT ip_address FROM entry_points WHERE id = ? LIMIT 1");
                $stmtIp->execute([$epId]);
                $entryIp = $stmtIp->fetch(PDO::FETCH_ASSOC)['ip_address'] ?? '';
                // No close() needed; PDO handles statement cleanup
                unset($stmtIp); // Explicitly unset for clarity
                
                if (empty($entryIp)) {
                    error_log("ERROR: No IP found for entry point ID={$epId} for booking ID={$bookingId}");
                    $allRequestsSuccessful = false;
                    continue;
                }
                
                if (!empty($pos)) {
                    $cardPos = (int)$pos - 1;
                    if ($cardPos < 0) {
                        error_log("ERROR: Invalid card position {$cardPos} for booking ID={$bookingId}, entry point ID={$epId}, database position={$pos}");
                        $allRequestsSuccessful = false;
                    } else {
                        $url = "http://{$entryIp}/clu_set1.cgi?box={$cardPos}&value={$pinCode}";
                        error_log("Attempting to send entry point code: URL={$url}");
                        if (!sendGetRequest($url, "Entry Point", $epId, $cardPos, $pinCode)) {
                            $allRequestsSuccessful = false;
                        } else {
                            error_log("Successfully set entry point code for booking ID={$bookingId} at entryIp={$entryIp}, card position {$cardPos} (database position {$pos}, card sets position " . ($cardPos + 1) . ") to {$pinCode}");
                        }
                    }
                } else {
                    error_log("Skipping code send for booking ID={$bookingId}, epId={$epId}: position is empty");
                    $allRequestsSuccessful = false;
                }
            }
        } else {
            error_log("No entry points or positions for booking ID={$bookingId}. Possibly none were selected");
        }
        
        // Mark codes as sent if all requests succeeded
        if ($allRequestsSuccessful) {
            $updateSql = "UPDATE bookings SET codes_sent = 1 WHERE id = ?";
            $updateStmt = $pdo->prepare($updateSql);
            $updateStmt->execute([$bookingId]);
            error_log("Successfully marked codes_sent=1 for booking ID={$bookingId}");
            unset($updateStmt); // Explicitly unset for clarity
        } else {
            error_log("Not marking codes_sent for booking ID={$bookingId}: Some requests failed or were skipped");
        }
    }
    
    // Clear access codes an hour after checkout
    error_log("=== STARTING CHECKOUT CLEANUP ===");
    $clearSql = "
        SELECT b.*, r.ip_address AS room_ip
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        WHERE b.codes_cleared = 0
          AND b.departure_datetime <= NOW()
          AND b.departure_datetime >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    ";
    
    error_log("Executing query to find recent checkouts:\n{$clearSql}");
    $clearStmt = $pdo->prepare($clearSql);
    $clearStmt->execute();
    $clearResult = $clearStmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("Found " . count($clearResult) . " bookings for code cleanup");
    
    foreach ($clearResult as $checkout) {
        $bookingId = $checkout['id'];
        $roomId = $checkout['room_id'];
        $roomIp = $checkout['room_ip'];
        $roomPosition = $checkout['room_position'];
        $entryPointIds = $checkout['entry_point_id'];
        $entryPositions = $checkout['positions'];
        $departureTime = $checkout['departure_datetime'];
        $status = $checkout['status'];
        
        error_log(
            "Processing checkout for code clearing: " .
            "ID={$bookingId}, roomId={$roomId}, roomIp={$roomIp}, " .
            "roomPosition={$roomPosition}, status={$status}, " .
            "departure_datetime={$departureTime}, " .
            "entryPointIds={$entryPointIds}, entryPositions={$entryPositions}"
        );
        
        // Validate time window
        $currentTimestamp = strtotime($currentTime);
        $departureTimestamp = strtotime($departureTime);
        $timeDiffMinutes = ($currentTimestamp - $departureTimestamp) / 60;
        if ($timeDiffMinutes < 0) {
            error_log("Booking ID={$bookingId} not yet eligible for cleanup: departure_datetime={$departureTime} is in the future");
            continue;
        } elseif ($timeDiffMinutes > 60) {
            error_log("Booking ID={$bookingId} outside 1-hour cleanup window: departure_datetime={$departureTime} is {$timeDiffMinutes} minutes ago");
            continue;
        } else {
            error_log("Booking ID={$bookingId} within 1-hour cleanup window: departure_datetime={$departureTime}, {$timeDiffMinutes} minutes ago");
        }
        
        $allClearRequestsSuccessful = true;
        
        // Clear room code
        if (!empty($roomIp) && !empty($roomPosition)) {
            $cardPos = (int)$roomPosition - 1;
            if ($cardPos < 0) {
                error_log("ERROR: Invalid card position {$cardPos} for booking ID={$bookingId}, room ID={$roomId}, database position={$roomPosition}");
                $allClearRequestsSuccessful = false;
            } else {
                $url = "http://{$roomIp}/clu_set1.cgi?box={$cardPos}&value=0";
                error_log("Attempting to clear room code: URL={$url}");
                if (!sendGetRequest($url, "Room", $roomId, $cardPos, "0")) {
                    $allClearRequestsSuccessful = false;
                } else {
                    error_log("Successfully cleared room code for booking ID={$bookingId} at roomIp={$roomIp}, card position {$cardPos} (database position {$roomPosition}, card clears position " . ($cardPos + 1) . ")");
                }
            }
        } else {
            error_log("Skipping room code clear for booking ID={$bookingId}: " . (empty($roomIp) ? "Missing room IP" : "") . (empty($roomPosition) ? " Missing room position" : ""));
            $allClearRequestsSuccessful = false;
        }
        
        // Clear entry point codes
        if (!empty($entryPointIds) && !empty($entryPositions)) {
            $entryPointsArray = explode(',', $entryPointIds);
            $positionsArray = explode(',', $entryPositions);
            
            if (count($entryPointsArray) !== count($positionsArray)) {
                error_log("ERROR: Mismatch in entry points and positions for booking ID={$bookingId}: entryPoints=" . count($entryPointsArray) . ", positions=" . count($positionsArray));
                $allClearRequestsSuccessful = false;
                continue;
            }
            
            error_log("Processing " . count($entryPointsArray) . " entry points for cleanup of booking ID={$bookingId}");
            
            for ($i = 0; $i < count($entryPointsArray); $i++) {
                $epId = trim($entryPointsArray[$i]);
                $pos = trim($positionsArray[$i]);
                
                error_log("Booking ID={$bookingId}: Attempting to clear code from entry point ID={$epId} at position={$pos}");
                
                $epIpStmt = $pdo->prepare("SELECT ip_address FROM entry_points WHERE id = ? LIMIT 1");
                $epIpStmt->execute([$epId]);
                $entryIp = $epIpStmt->fetch(PDO::FETCH_ASSOC)['ip_address'] ?? '';
                // No close() needed; PDO handles statement cleanup
                unset($epIpStmt); // Explicitly unset for clarity
                
                if (empty($entryIp)) {
                    error_log("ERROR: No IP found for entry point ID={$epId} for booking ID={$bookingId}");
                    $allClearRequestsSuccessful = false;
                    continue;
                }
                
                if (!empty($pos)) {
                    $cardPos = (int)$pos - 1;
                    if ($cardPos < 0) {
                        error_log("ERROR: Invalid card position {$cardPos} for booking ID={$bookingId}, entry point ID={$epId}, database position={$pos}");
                        $allClearRequestsSuccessful = false;
                    } else {
                        $url = "http://{$entryIp}/clu_set1.cgi?box={$cardPos}&value=0";
                        error_log("Attempting to clear entry point code: URL={$url}");
                        if (!sendGetRequest($url, "Entry Point", $epId, $cardPos, "0")) {
                            $allClearRequestsSuccessful = false;
                        } else {
                            error_log("Successfully cleared entry point code for booking ID={$bookingId} at entryIp={$entryIp}, card position {$cardPos} (database position {$pos}, card clears position " . ($cardPos + 1) . ")");
                        }
                    }
                } else {
                    error_log("Skipping code clear for booking ID={$bookingId}, epId={$epId}: position is empty");
                    $allClearRequestsSuccessful = false;
                }
            }
        } else {
            error_log("No entry points or positions for booking ID={$bookingId} during cleanup");
        }
        
        // Mark codes as cleared if all requests succeeded
        if ($allClearRequestsSuccessful) {
            $updateClearSql = "UPDATE bookings SET codes_cleared = 1 WHERE id = ?";
            $updateClearStmt = $pdo->prepare($updateClearSql);
            $updateClearStmt->execute([$bookingId]);
            error_log("Successfully marked codes_cleared=1 for booking ID={$bookingId}");
            unset($updateClearStmt); // Explicitly unset for clarity
        } else {
            error_log("Not marking codes_cleared for booking ID={$bookingId}: Some clear requests failed or were skipped");
        }
    }
    
    // No close() needed for $clearStmt; PDO handles cleanup
    unset($clearStmt); // Explicitly unset for clarity
    error_log("Checkout cleanup completed successfully");
    error_log("=== CRON END ===");
    
} catch (Exception $e) {
    $errorMsg = "Error in cron script: " . $e->getMessage();
    error_log($errorMsg);
    echo $errorMsg . "\n";
}
?>