
<?php
// Enable detailed error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', '/var/log/php/error.log'); // Make sure this path exists and is writable

// Add a function to log errors for debugging
function log_error($message, $context = null) {
    $timestamp = date('Y-m-d H:i:s');
    $contextInfo = $context ? " | Context: " . json_encode($context) : "";
    $logMessage = "[$timestamp] ERROR: $message$contextInfo\n";
    
    // Log to PHP error log
    error_log($logMessage);
    
    // Also append to a custom log file for the admin dashboard
    $logFile = __DIR__ . '/../logs/admin_dashboard.log';
    
    // Create logs directory if it doesn't exist
    if (!file_exists(__DIR__ . '/../logs')) {
        mkdir(__DIR__ . '/../logs', 0755, true);
    }
    
    // Append to the log file
    file_put_contents($logFile, $logMessage, FILE_APPEND);
    
    return $logMessage;
}

// Make sure directory for logs is created
if (!file_exists(__DIR__ . '/../logs')) {
    mkdir(__DIR__ . '/../logs', 0755, true);
    error_log("Created logs directory");
}

// Database configuration
$db_host = "localhost";
$db_user = "checkin"; // Replace with your MySQL username
$db_pass = "checkin"; // Replace with your MySQL password
$db_name = "checkin";

// Log database connection attempt
log_error("Attempting database connection with host: $db_host", [
    'user' => $db_user,
    'database' => $db_name
]);

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection with detailed error logging
if ($conn->connect_error) {
    log_error("Database connection failed: " . $conn->connect_error, [
        'host' => $db_host,
        'user' => $db_user,
        'database' => $db_name
    ]);
    die("Connection failed: " . $conn->connect_error);
}

log_error("Database connection successful");

// Function to secure input data
function secure_input($data) {
    global $conn;
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $conn->real_escape_string($data);
}

// Function to generate a random access code
function generate_access_code() {
    return str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
}

// Function to assign PIN code to entry points at a specific position
function assign_pin_to_entry_points($booking_id, $entry_point_ids, $pin_code, $position = null) {
    global $conn;
    
    // If no position is provided, find the first available position
    if ($position === null) {
        // Get the highest position currently in use for any entry point
        $stmt = $conn->prepare("SELECT MAX(position) as max_position FROM entry_point_pins");
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        // Start with position 1 or increment from highest position
        $position = ($row['max_position'] === null) ? 1 : min($row['max_position'] + 1, 64);
        
        // If we've reached the maximum, reuse position 1
        if ($position > 64) {
            $position = 1;
        }
    }
    
    // Validate position is between 1 and 64
    $position = max(1, min(64, intval($position)));
    
    // Loop through each entry point and assign the PIN
    foreach ($entry_point_ids as $entry_point_id) {
        // Check if there's already a PIN at this position for this entry point
        $stmt = $conn->prepare("SELECT id FROM entry_point_pins WHERE entry_point_id = ? AND position = ?");
        $stmt->bind_param("si", $entry_point_id, $position);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // Update existing PIN at this position
            $row = $result->fetch_assoc();
            $stmt = $conn->prepare("UPDATE entry_point_pins SET pin_code = ?, booking_id = ? WHERE id = ?");
            $stmt->bind_param("sii", $pin_code, $booking_id, $row['id']);
        } else {
            // Insert new PIN at this position
            $stmt = $conn->prepare("INSERT INTO entry_point_pins (entry_point_id, position, pin_code, booking_id) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("sisi", $entry_point_id, $position, $pin_code, $booking_id);
        }
        
        if (!$stmt->execute()) {
            log_error("Error assigning PIN to entry point: " . $stmt->error, [
                'booking_id' => $booking_id,
                'entry_point_id' => $entry_point_id,
                'position' => $position,
                'pin_code' => $pin_code
            ]);
            return false;
        }
    }
    
    return true;
}

// Setup entry points if they don't exist already
function setup_entry_points() {
    global $conn;
    
    // Check if entry_points table exists
    $result = $conn->query("SHOW TABLES LIKE 'entry_points'");
    if ($result->num_rows == 0) {
        // Create entry_points table
        $sql = "CREATE TABLE IF NOT EXISTS entry_points (
            id VARCHAR(20) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        
        if (!$conn->query($sql)) {
            log_error("Error creating entry_points table: " . $conn->error);
            return false;
        }
        
        log_error("Created entry_points table");
    }
    
    // Check if room_entry_points table exists
    $result = $conn->query("SHOW TABLES LIKE 'room_entry_points'");
    if ($result->num_rows == 0) {
        // Create room_entry_points table
        $sql = "CREATE TABLE IF NOT EXISTS room_entry_points (
            id INT(11) AUTO_INCREMENT PRIMARY KEY,
            room_id VARCHAR(20) NOT NULL,
            entry_point_id VARCHAR(20) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_room_entry (room_id, entry_point_id),
            FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
            FOREIGN KEY (entry_point_id) REFERENCES entry_points(id) ON DELETE CASCADE
        )";
        
        if (!$conn->query($sql)) {
            log_error("Error creating room_entry_points table: " . $conn->error);
            return false;
        }
        
        log_error("Created room_entry_points table");
    }
    
    // Check if we need to create entry_point_pins table
    $result = $conn->query("SHOW TABLES LIKE 'entry_point_pins'");
    if ($result->num_rows == 0) {
        // Create entry_point_pins table
        $sql = "CREATE TABLE IF NOT EXISTS entry_point_pins (
            id INT(11) AUTO_INCREMENT PRIMARY KEY,
            entry_point_id VARCHAR(20) NOT NULL,
            position INT NOT NULL CHECK (position BETWEEN 1 AND 64),
            pin_code VARCHAR(10) NOT NULL,
            booking_id INT(11) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_entry_position (entry_point_id, position),
            FOREIGN KEY (entry_point_id) REFERENCES entry_points(id) ON DELETE CASCADE,
            FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
        )";
        
        if (!$conn->query($sql)) {
            log_error("Error creating entry_point_pins table: " . $conn->error);
            return false;
        }
        
        log_error("Created entry_point_pins table");
    }
    
    // Check if we need to insert default entry points
    $result = $conn->query("SELECT COUNT(*) as count FROM entry_points");
    $row = $result->fetch_assoc();
    
    if ($row['count'] == 0) {
        // Insert default entry points
        $entry_points = [
            ['entry1', 'Main Entrance', 'Front door at the main lobby'],
            ['entry2', 'Side Entrance', 'Side entrance near the parking lot'],
            ['entry3', 'Back Entrance', 'Back entrance near the garden']
        ];
        
        foreach ($entry_points as $entry) {
            $stmt = $conn->prepare("INSERT INTO entry_points (id, name, description) VALUES (?, ?, ?)");
            $stmt->bind_param("sss", $entry[0], $entry[1], $entry[2]);
            
            if (!$stmt->execute()) {
                log_error("Error inserting entry point {$entry[1]}: " . $stmt->error);
            } else {
                log_error("Added entry point: {$entry[1]}");
            }
        }
        
        // Map rooms to entry points
        $room_entry_mappings = [
            ['room1', 'entry1'],
            ['room1', 'entry2'],
            ['room2', 'entry1'],
            ['room2', 'entry3'],
            ['room3', 'entry2'],
            ['room3', 'entry3'],
            ['room4', 'entry1'],
            ['room4', 'entry2'],
            ['room4', 'entry3'],
            ['room5', 'entry1']
        ];
        
        foreach ($room_entry_mappings as $mapping) {
            // Check if room exists first
            $stmt = $conn->prepare("SELECT id FROM rooms WHERE id = ?");
            $stmt->bind_param("s", $mapping[0]);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows == 0) {
                log_error("Room {$mapping[0]} not found, cannot create mapping to entry point {$mapping[1]}");
                continue;
            }
            
            // Create the mapping
            $stmt = $conn->prepare("INSERT INTO room_entry_points (room_id, entry_point_id) VALUES (?, ?)");
            $stmt->bind_param("ss", $mapping[0], $mapping[1]);
            
            if (!$stmt->execute()) {
                log_error("Error mapping room {$mapping[0]} to entry point {$mapping[1]}: " . $stmt->error);
            } else {
                log_error("Mapped room {$mapping[0]} to entry point {$mapping[1]}");
            }
        }
    }
    
    // Update bookings table if it doesn't have entry_point_id column
    $result = $conn->query("SHOW COLUMNS FROM bookings LIKE 'entry_point_id'");
    if ($result->num_rows == 0) {
        $sql = "ALTER TABLE bookings ADD COLUMN entry_point_id VARCHAR(20) NOT NULL AFTER room_id, 
                ADD CONSTRAINT fk_booking_entry_point FOREIGN KEY (entry_point_id) REFERENCES entry_points(id)";
        
        if (!$conn->query($sql)) {
            log_error("Error adding entry_point_id to bookings table: " . $conn->error);
        } else {
            log_error("Added entry_point_id column to bookings table");
        }
    }
    
    return true;
}

// Run the setup function to ensure entry points exist
setup_entry_points();
?>
