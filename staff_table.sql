
-- Staff table
CREATE TABLE IF NOT EXISTS `staff` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `pin_code` varchar(20) NOT NULL COMMENT 'PIN code for entry access',
  `access_all_rooms` tinyint(1) NOT NULL DEFAULT '0',
  `rooms` text,
  `room_positions` text,
  `entry_points` text,
  `entry_point_positions` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
