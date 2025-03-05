
<?php
// Database configuration
$db_host = "localhost";
$db_user = "your_db_username"; // Replace with your MySQL username
$db_pass = "your_db_password"; // Replace with your MySQL password

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
$conn->select_db("booking_system");

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

// Create rooms table
$sql = "CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
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
    arrival_date_time DATETIME NOT NULL,
    departure_date_time DATETIME NOT NULL,
    access_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
)";

if ($conn->query($sql) === TRUE) {
    echo "Bookings table created successfully<br>";
} else {
    echo "Error creating bookings table: " . $conn->error . "<br>";
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
        ['room1', 'Room 1'],
        ['room2', 'Room 2'],
        ['room3', 'Room 3'],
        ['room4', 'Room 4'],
        ['room5', 'Room 5']
    ];
    
    $stmt = $conn->prepare("INSERT INTO rooms (id, name) VALUES (?, ?)");
    
    foreach ($rooms as $room) {
        $stmt->bind_param("ss", $room[0], $room[1]);
        if ($stmt->execute()) {
            echo "Room '{$room[1]}' created successfully<br>";
        } else {
            echo "Error creating room '{$room[1]}': " . $stmt->error . "<br>";
        }
    }
}

echo "<br>Setup completed. <a href='/'>Go to login page</a>";

// Close connection
$conn->close();
?>
