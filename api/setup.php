
<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database configuration
$db_host = "localhost";
$db_user = "checkin"; // Replace with your MySQL username
$db_pass = "checkin"; // Replace with your MySQL password

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database
$sql = "CREATE DATABASE IF NOT EXISTS booking_system";
if ($conn->query($sql) === TRUE) {
    echo "Database created successfully<br>";
} else {
    echo "Error creating database: " . $conn->error . "<br>";
    exit;
}

// Select the database
$conn->select_db("checkin");

// Create users table
$sql = "CREATE TABLE IF NOT EXISTS users (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_admin TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sql) === TRUE) {
    echo "Users table created successfully<br>";
} else {
    echo "Error creating users table: " . $conn->error . "<br>";
}

// Create rooms table with passcode settings
$sql = "CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    fixed_passcode VARCHAR(10) NULL,
    reset_hours INT DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

if ($conn->query($sql) === TRUE) {
    echo "Rooms table created successfully<br>";
} else {
    echo "Error creating rooms table: " . $conn->error . "<br>";
}

// Create bookings table
$sql = "CREATE TABLE IF NOT EXISTS bookings (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(20) NOT NULL,
    guest_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    arrival_datetime DATETIME NOT NULL,
    departure_datetime DATETIME NOT NULL,
    access_code VARCHAR(10) NOT NULL,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT
)";

if ($conn->query($sql) === TRUE) {
    echo "Bookings table created successfully<br>";
} else {
    echo "Error creating bookings table: " . $conn->error . "<br>";
}

// Create notification settings table
$sql = "CREATE TABLE IF NOT EXISTS notification_settings (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    email_enabled TINYINT(1) DEFAULT 1,
    sms_enabled TINYINT(1) DEFAULT 0,
    email_template TEXT,
    sms_template VARCHAR(255),
    smtp_host VARCHAR(100),
    smtp_port INT,
    smtp_username VARCHAR(100),
    smtp_password VARCHAR(100),
    sms_api_key VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

if ($conn->query($sql) === TRUE) {
    echo "Notification settings table created successfully<br>";
} else {
    echo "Error creating notification settings table: " . $conn->error . "<br>";
}

// Create access logs table
$sql = "CREATE TABLE IF NOT EXISTS access_logs (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    booking_id INT(11) NOT NULL,
    access_datetime DATETIME NOT NULL, 
    access_result ENUM('granted', 'denied') NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
)";

if ($conn->query($sql) === TRUE) {
    echo "Access logs table created successfully<br>";
} else {
    echo "Error creating access logs table: " . $conn->error . "<br>";
}

// Check if default admin user exists
$stmt = $conn->prepare("SELECT * FROM users WHERE username = 'admin'");
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    // Create default admin user
    $admin_password = password_hash('admin', PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO users (username, password, is_admin) VALUES ('admin', ?, 1)");
    $stmt->bind_param("s", $admin_password);
    
    if ($stmt->execute()) {
        echo "Default admin user created successfully<br>";
    } else {
        echo "Error creating default admin user: " . $stmt->error . "<br>";
    }
}

// Check if default regular user exists
$stmt = $conn->prepare("SELECT * FROM users WHERE username = 'user'");
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    // Create default regular user
    $user_password = password_hash('user', PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO users (username, password, is_admin) VALUES ('user', ?, 0)");
    $stmt->bind_param("s", $user_password);
    
    if ($stmt->execute()) {
        echo "Default regular user created successfully<br>";
    } else {
        echo "Error creating default regular user: " . $stmt->error . "<br>";
    }
}

// Check if rooms exist
$stmt = $conn->prepare("SELECT * FROM rooms");
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    // Insert default rooms
    $rooms = [
        ['room1', 'Room 1', 'Standard room with queen bed'],
        ['room2', 'Room 2', 'Deluxe room with king bed'],
        ['room3', 'Room 3', 'Suite with kitchenette'],
        ['room4', 'Room 4', 'Family room with two beds'],
        ['room5', 'Room 5', 'Executive suite with view']
    ];
    
    $stmt = $conn->prepare("INSERT INTO rooms (id, name, description) VALUES (?, ?, ?)");
    
    foreach ($rooms as $room) {
        $stmt->bind_param("sss", $room[0], $room[1], $room[2]);
        if ($stmt->execute()) {
            echo "Room '{$room[1]}' created successfully<br>";
        } else {
            echo "Error creating room '{$room[1]}': " . $stmt->error . "<br>";
        }
    }
}

// Check if default notification settings exist
$stmt = $conn->prepare("SELECT * FROM notification_settings LIMIT 1");
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    // Insert default notification settings
    $defaultEmailTemplate = '
    <html>
    <head>
        <title>Your Booking Confirmation</title>
    </head>
    <body>
        <h2>Booking Confirmation</h2>
        <p>Dear {GUEST_NAME},</p>
        <p>Your booking has been confirmed with the following details:</p>
        <table style="border-collapse: collapse; width: 100%;">
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;"><strong>Room:</strong></td>
                <td style="border: 1px solid #ddd; padding: 8px;">{ROOM_NAME}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;"><strong>Check-in:</strong></td>
                <td style="border: 1px solid #ddd; padding: 8px;">{ARRIVAL_DATETIME}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;"><strong>Check-out:</strong></td>
                <td style="border: 1px solid #ddd; padding: 8px;">{DEPARTURE_DATETIME}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;"><strong>Access Code:</strong></td>
                <td style="border: 1px solid #ddd; padding: 8px;"><h3>{ACCESS_CODE}</h3></td>
            </tr>
        </table>
        <p>Please use this access code during your stay.</p>
        <p>Thank you for choosing our service!</p>
    </body>
    </html>
    ';
    
    $defaultSmsTemplate = 'Your booking at {ROOM_NAME} is confirmed. Access code: {ACCESS_CODE}. Check-in: {ARRIVAL_DATETIME}.';
    
    $stmt = $conn->prepare("INSERT INTO notification_settings (email_enabled, sms_enabled, email_template, sms_template, smtp_host, smtp_port) VALUES (1, 0, ?, ?, 'smtp.example.com', 587)");
    $stmt->bind_param("ss", $defaultEmailTemplate, $defaultSmsTemplate);
    
    if ($stmt->execute()) {
        echo "Default notification settings created successfully<br>";
    } else {
        echo "Error creating default notification settings: " . $stmt->error . "<br>";
    }
}

echo "<br>Setup completed. <a href='/'>Go to login page</a>";

// Close connection
$conn->close();
?>
