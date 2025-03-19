
-- Add entry_point_pins table if it doesn't exist
CREATE TABLE IF NOT EXISTS entry_point_pins (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add multiple entry points to bookings feature
-- For testing, you can run this to set up some sample data:

-- 1. First ensure we have entry points
INSERT IGNORE INTO entry_points (id, name, description) VALUES
('entry1', 'Main Entrance', 'Front door at the main lobby'),
('entry2', 'Side Entrance', 'Side entrance near the parking lot'),
('entry3', 'Back Entrance', 'Back entrance near the garden');

-- 2. Map all rooms to all entry points for testing
INSERT IGNORE INTO room_entry_points (room_id, entry_point_id)
SELECT r.id, e.id
FROM rooms r
CROSS JOIN entry_points e
ON DUPLICATE KEY UPDATE room_id = room_id;

-- 3. Sample query to view pin assignments
-- SELECT e.name as entry_point, ep.position, ep.pin_code, b.guest_name, r.name as room
-- FROM entry_point_pins ep
-- JOIN entry_points e ON ep.entry_point_id = e.id
-- JOIN bookings b ON ep.booking_id = b.id
-- JOIN rooms r ON b.room_id = r.id
-- ORDER BY e.name, ep.position;
