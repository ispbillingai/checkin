

-- --------------------------------------------------------

--
-- Table structure for table `access_logs`
--

CREATE TABLE `access_logs` (
  `id` int NOT NULL,
  `booking_id` int NOT NULL,
  `access_datetime` datetime NOT NULL,
  `access_result` enum('granted','denied') NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ----

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int NOT NULL,
  `room_id` varchar(20) NOT NULL,
  `guest_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `arrival_datetime` datetime NOT NULL,
  `departure_datetime` datetime NOT NULL,
  `access_code` varchar(10) NOT NULL,
  `notes` text,
  `status` enum('active','completed','cancelled') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `entry_point_id` varchar(255) NOT NULL,
  `positions` varchar(255) NOT NULL,
  `room_position` int DEFAULT NULL,
  `codes_sent` tinyint(1) NOT NULL DEFAULT '0'
) ----

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `room_id`, `guest_name`, `email`, `phone`, `arrival_datetime`, `departure_datetime`, `access_code`, `notes`, `status`, `created_at`, `updated_at`, `entry_point_id`, `positions`, `room_position`, `codes_sent`) VALUES
(1, 'room1', 'FRANCIS MAGOMERE', 'magomerefrancis61@gmail.com', '0796381603', '2025-03-09 12:59:00', '2025-03-10 12:59:00', '960873', NULL, 'active', '2025-03-09 13:00:02', '2025-03-20 21:22:01', '', '', NULL, 0),
(5, 'room1', 'FRANCIS MAGOMERE', 'magomerefrancis61@gmail.com', '', '2025-03-21 00:43:00', '2025-03-26 02:43:00', '00100', 'sdfrd', 'active', '2025-03-20 21:43:55', '2025-03-20 21:43:55', 'entry3,entry1', '2,2', NULL, 0),
(6, 'room1', 'peter', 'Juma@gmail.com', '', '2025-03-21 02:56:00', '2025-03-26 02:56:00', '412499', 'ssa', 'active', '2025-03-20 21:57:09', '2025-03-20 21:57:09', 'entry3,entry1', '2,3', 1, 0),
(7, 'room3', 'm,nsdfkjdsn dsfjk', 'magomerefrancis61@gmail.com', '04123111444', '2025-03-22 03:02:00', '2025-03-23 01:03:00', '343558', '4232', 'active', '2025-03-20 22:00:52', '2025-03-20 22:00:52', 'entry3', '5', 4, 0),
(8, 'room1', 'Jckfkf', 'fnnffj@gmail.com', '0796381603', '2025-03-26 10:02:00', '2025-03-27 06:02:00', '816812', 'Fkfkf', 'active', '2025-03-21 07:03:10', '2025-03-21 07:03:10', 'entry3,entry1,entry2', '23,2,3', 2, 0),
(9, 'room7', 'Test', 'Test@gmail.com', '0796381603', '2025-03-21 11:11:00', '2025-03-22 04:15:00', '940903', 'ghfgh', 'active', '2025-03-21 10:10:23', '2025-03-21 10:12:29', 'entry44', '12', 12, 1);

-- --------------------------------------------------------

--
-- Table structure for table `entry_points`
--

CREATE TABLE `entry_points` (
  `id` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IPv4 or IPv6 address'
) ----

--
-- Dumping data for table `entry_points`
--

INSERT INTO `entry_points` (`id`, `name`, `description`, `created_at`, `updated_at`, `ip_address`) VALUES
('entry1', 'Main Entrance', 'Front door at the main lobby', '2025-03-19 12:29:44', '2025-03-19 12:29:44', NULL),
('entry2', 'Side Entrance', 'Side entrance near the parking lot', '2025-03-19 12:29:44', '2025-03-19 12:29:44', NULL),
('entry3', 'Back Entrance', 'Back entrance near the garden', '2025-03-19 12:29:44', '2025-03-19 12:29:44', NULL),
('entry4', 'Backdoor', 'good Door', '2025-03-21 09:16:56', '2025-03-21 09:16:56', NULL),
('entry44', 'Backdoor', 'dfgf', '2025-03-21 09:30:09', '2025-03-21 09:30:09', '192.168.180.22'),
('ttt', 'tttt', 'tttt', '2025-03-21 09:17:15', '2025-03-21 09:17:15', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `entry_point_pins`
--

CREATE TABLE `entry_point_pins` (
  `id` int NOT NULL,
  `entry_point_id` varchar(20) NOT NULL,
  `position` int NOT NULL,
  `pin_code` varchar(10) NOT NULL,
  `booking_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Table structure for table `notification_settings`
--

CREATE TABLE `notification_settings` (
  `id` int NOT NULL,
  `email_enabled` tinyint(1) DEFAULT '1',
  `sms_enabled` tinyint(1) DEFAULT '0',
  `email_template` text,
  `sms_template` varchar(255) DEFAULT NULL,
  `smtp_host` varchar(100) DEFAULT NULL,
  `smtp_port` int DEFAULT NULL,
  `smtp_username` varchar(100) DEFAULT NULL,
  `smtp_password` varchar(100) DEFAULT NULL,
  `sms_api_key` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ----

--
-- Dumping data for table `notification_settings`
--

INSERT INTO `notification_settings` (`id`, `email_enabled`, `sms_enabled`, `email_template`, `sms_template`, `smtp_host`, `smtp_port`, `smtp_username`, `smtp_password`, `sms_api_key`, `created_at`, `updated_at`) VALUES
(1, 1, 0, '<html><head><title>Your Booking Confirmation</title></head><body><h2>Booking Confirmation</h2><p>Dear {GUEST_NAME},</p><p>Your booking has been confirmed with the following details:</p><table style=\"border-collapse: collapse; width: 100%;\"><tr><td style=\"border: 1px solid #ddd; padding: 8px;\"><strong>Room:</strong></td><td style=\"border: 1px solid #ddd; padding: 8px;\">{ROOM_NAME}</td></tr><tr><td style=\"border: 1px solid #ddd; padding: 8px;\"><strong>Check-in:</strong></td><td style=\"border: 1px solid #ddd; padding: 8px;\">{ARRIVAL_DATETIME}</td></tr><tr><td style=\"border: 1px solid #ddd; padding: 8px;\"><strong>Check-out:</strong></td><td style=\"border: 1px solid #ddd; padding: 8px;\">{DEPARTURE_DATETIME}</td></tr><tr><td style=\"border: 1px solid #ddd; padding: 8px;\"><strong>Access Code:</strong></td><td style=\"border: 1px solid #ddd; padding: 8px;\"><h3>{ACCESS_CODE}</h3></td></tr></table><p>Please use this access code during your stay.</p><p>Thank you for choosing our service!</p></body></html>', 'Your booking at {ROOM_NAME} is confirmed. Access code: {ACCESS_CODE}. Check-in: {ARRIVAL_DATETIME}.', 'smtp.example.com', 587, NULL, NULL, NULL, '2025-03-08 20:59:13', '2025-03-08 20:59:13');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `fixed_passcode` varchar(10) DEFAULT NULL,
  `reset_hours` int DEFAULT '2',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IPv4 or IPv6 address'
) ----

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `name`, `description`, `fixed_passcode`, `reset_hours`, `created_at`, `updated_at`, `ip_address`) VALUES
('room1', 'Room 1', 'Standard room with queen bed', NULL, 2, '2025-03-08 20:59:13', '2025-03-08 20:59:13', NULL),
('room2', 'Room 2', 'Deluxe room with king bed', NULL, 2, '2025-03-19 12:32:20', '2025-03-19 12:32:20', NULL),
('room3', 'Room 3', 'Suite with kitchenette', NULL, 2, '2025-03-08 20:59:13', '2025-03-08 20:59:13', NULL),
('room4', 'Room 4', 'Family room with two beds', NULL, 2, '2025-03-08 20:59:13', '2025-03-08 20:59:13', NULL),
('room5', 'Room 5', 'Executive suite with view', NULL, 2, '2025-03-08 20:59:13', '2025-03-08 20:59:13', NULL),
('room7', 'room7', 'Best', NULL, 2, '2025-03-21 09:29:41', '2025-03-21 09:29:41', '192.168.100.2'),
('roomt', 'Main room', 'Best room', NULL, 2, '2025-03-21 09:15:56', '2025-03-21 09:15:56', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `room_entry_points`
--

CREATE TABLE `room_entry_points` (
  `id` int NOT NULL,
  `room_id` varchar(20) NOT NULL,
  `entry_point_id` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ----

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `is_admin` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ----

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `is_admin`, `created_at`) VALUES
(1, 'admin', '$2y$10$o.a.lqBjL2HwUVLXs9QIEeG0Z9RrvAYx0zEWvy6jEqpxH8c/9MZ4K', 1, '2025-03-08 20:59:13'),
(2, 'user', '$2y$10$d8D2q2LXlQZ70R/2F//yruN8pLXQkTMWb80XL33sq/eaVs0vAP8KW', 0, '2025-03-08 20:59:13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `access_logs`
--
ALTER TABLE `access_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `entry_points`
--
ALTER TABLE `entry_points`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `entry_point_pins`
--
ALTER TABLE `entry_point_pins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_entry_position` (`entry_point_id`,`position`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Indexes for table `notification_settings`
--
ALTER TABLE `notification_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `room_entry_points`
--
ALTER TABLE `room_entry_points`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_room_entry` (`room_id`,`entry_point_id`),
  ADD KEY `entry_point_id` (`entry_point_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `access_logs`
--
ALTER TABLE `access_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `entry_point_pins`
--
ALTER TABLE `entry_point_pins`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notification_settings`
--
ALTER TABLE `notification_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `room_entry_points`
--
ALTER TABLE `room_entry_points`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `access_logs`
--
ALTER TABLE `access_logs`
  ADD CONSTRAINT `access_logs_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `entry_point_pins`
--
ALTER TABLE `entry_point_pins`
  ADD CONSTRAINT `entry_point_pins_ibfk_1` FOREIGN KEY (`entry_point_id`) REFERENCES `entry_points` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `entry_point_pins_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `room_entry_points`
--
ALTER TABLE `room_entry_points`
  ADD CONSTRAINT `room_entry_points_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `room_entry_points_ibfk_2` FOREIGN KEY (`entry_point_id`) REFERENCES `entry_points` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
