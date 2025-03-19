
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_admin TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    fixed_passcode VARCHAR(10) NULL,
    reset_hours INT DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create entry points table
CREATE TABLE IF NOT EXISTS entry_points (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create room_entry_points table (for mapping rooms to entry points)
CREATE TABLE IF NOT EXISTS room_entry_points (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(20) NOT NULL,
    entry_point_id VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_room_entry (room_id, entry_point_id),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (entry_point_id) REFERENCES entry_points(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(20) NOT NULL,
    entry_point_id VARCHAR(20) NOT NULL,
    guest_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    arrival_datetime DATETIME NOT NULL,
    departure_datetime DATETIME NOT NULL,
    access_code VARCHAR(10) NOT NULL,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
    FOREIGN KEY (entry_point_id) REFERENCES entry_points(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create access_logs table
CREATE TABLE IF NOT EXISTS access_logs (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    booking_id INT(11) NOT NULL,
    entry_point_id VARCHAR(20) NOT NULL,
    access_datetime DATETIME NOT NULL,
    access_result ENUM('granted', 'denied') NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (entry_point_id) REFERENCES entry_points(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default admin user
INSERT INTO users (username, password, is_admin) 
VALUES ('admin', '$2y$10$o.a.lqBjL2HwUVLXs9QIEeG0Z9RrvAYx0zEWvy6jEqpxH8c/9MZ4K', 1)
ON DUPLICATE KEY UPDATE username = username;

-- Insert default regular user
INSERT INTO users (username, password, is_admin) 
VALUES ('user', '$2y$10$d8D2q2LXlQZ70R/2F//yruN8pLXQkTMWb80XL33sq/eaVs0vAP8KW', 0)
ON DUPLICATE KEY UPDATE username = username;

-- Insert default rooms
INSERT INTO rooms (id, name, description) VALUES
('room1', 'Room 1', 'Standard room with queen bed'),
('room2', 'Room 2', 'Deluxe room with king bed'),
('room3', 'Room 3', 'Suite with kitchenette'),
('room4', 'Room 4', 'Family room with two beds'),
('room5', 'Room 5', 'Executive suite with view')
ON DUPLICATE KEY UPDATE id = id;

-- Insert default entry points
INSERT INTO entry_points (id, name, description) VALUES
('entry1', 'Main Entrance', 'Front door at the main lobby'),
('entry2', 'Side Entrance', 'Side entrance near the parking lot'),
('entry3', 'Back Entrance', 'Back entrance near the garden')
ON DUPLICATE KEY UPDATE id = id;

-- Map rooms to entry points
INSERT INTO room_entry_points (room_id, entry_point_id) VALUES
('room1', 'entry1'),
('room1', 'entry2'),
('room2', 'entry1'),
('room2', 'entry3'),
('room3', 'entry2'),
('room3', 'entry3'),
('room4', 'entry1'),
('room4', 'entry2'),
('room4', 'entry3'),
('room5', 'entry1')
ON DUPLICATE KEY UPDATE id = id;

-- Insert default notification settings
INSERT INTO notification_settings (email_enabled, sms_enabled, email_template, sms_template, smtp_host, smtp_port) 
VALUES (
    1, 
    0, 
    '<html><head><title>Your Booking Confirmation</title></head><body><h2>Booking Confirmation</h2><p>Dear {GUEST_NAME},</p><p>Your booking has been confirmed with the following details:</p><table style="border-collapse: collapse; width: 100%;"><tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Room:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">{ROOM_NAME}</td></tr><tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Entry Point:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">{ENTRY_POINT_NAME}</td></tr><tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Check-in:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">{ARRIVAL_DATETIME}</td></tr><tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Check-out:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">{DEPARTURE_DATETIME}</td></tr><tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Access Code:</strong></td><td style="border: 1px solid #ddd; padding: 8px;"><h3>{ACCESS_CODE}</h3></td></tr></table><p>Please use this access code at the specified entry point during your stay.</p><p>Thank you for choosing our service!</p></body></html>', 
    'Your booking at {ROOM_NAME} is confirmed. Access code: {ACCESS_CODE} for {ENTRY_POINT_NAME}. Check-in: {ARRIVAL_DATETIME}.', 
    'smtp.example.com', 
    587
) ON DUPLICATE KEY UPDATE id = id;
