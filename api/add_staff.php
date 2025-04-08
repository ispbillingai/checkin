
<?php
require_once '../php/db_config.php';

// Check if the request has a valid authorization header
$headers = getallheaders();
if (!isset($headers['Authorization']) || empty($headers['Authorization'])) {
    echo json_encode(['success' => false, 'message' => 'Authorization required']);
    exit;
}

// Extract the token from the Authorization header
$authHeader = $headers['Authorization'];
$token = str_replace('Bearer ', '', $authHeader);

// Verify the token (simple check for now - in production, use proper JWT validation)
if (empty($token)) {
    echo json_encode(['success' => false, 'message' => 'Invalid token']);
    exit;
}

// Get JSON data from request body
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate required fields
if (!isset($data['name']) || empty($data['name']) || 
    !isset($data['email']) || empty($data['email']) ||
    !isset($data['password']) || empty($data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Name, email, and PIN code are required']);
    exit;
}

try {
    // Connect to database
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if email already exists
    $checkStmt = $pdo->prepare("SELECT id FROM staff WHERE email = ?");
    $checkStmt->execute([$data['email']]);
    
    if ($checkStmt->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'Email already exists']);
        exit;
    }
    
    // Insert new staff
    $stmt = $pdo->prepare("INSERT INTO staff (name, email, phone, pin_code, access_all_rooms, rooms, room_positions, entry_points, entry_point_positions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    // Store the pin code as is, no hashing needed since it's an entry code
    $pinCode = $data['password']; // Using the 'password' field from the form as the PIN code
    $accessAllRooms = isset($data['access_all_rooms']) ? $data['access_all_rooms'] : 0;
    $rooms = isset($data['rooms']) ? $data['rooms'] : '';
    $roomPositions = isset($data['room_positions']) ? $data['room_positions'] : '';
    $entryPoints = isset($data['entry_points']) ? $data['entry_points'] : '';
    $entryPointPositions = isset($data['entry_point_positions']) ? $data['entry_point_positions'] : '';
    
    $stmt->execute([
        $data['name'],
        $data['email'],
        isset($data['phone']) ? $data['phone'] : '',
        $pinCode,
        $accessAllRooms,
        $rooms,
        $roomPositions,
        $entryPoints,
        $entryPointPositions
    ]);
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Staff added successfully',
        'id' => $pdo->lastInsertId()
    ]);
} catch (PDOException $e) {
    // Log error and return error response
    error_log("Database error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
