
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
if (!isset($data['id']) || empty($data['id']) ||
    !isset($data['name']) || empty($data['name']) || 
    !isset($data['email']) || empty($data['email'])) {
    echo json_encode(['success' => false, 'message' => 'ID, name, and email are required']);
    exit;
}

try {
    // Connect to database
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if email already exists for another staff member
    $checkStmt = $pdo->prepare("SELECT id FROM staff WHERE email = ? AND id != ?");
    $checkStmt->execute([$data['email'], $data['id']]);
    
    if ($checkStmt->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'Email already exists']);
        exit;
    }
    
    // Prepare base update query
    $sql = "UPDATE staff SET name = ?, email = ?, phone = ?, access_all_rooms = ?, rooms = ?, room_positions = ?, entry_points = ?, entry_point_positions = ?";
    $params = [
        $data['name'],
        $data['email'],
        isset($data['phone']) ? $data['phone'] : '',
        isset($data['access_all_rooms']) ? $data['access_all_rooms'] : 0,
        isset($data['rooms']) ? $data['rooms'] : '',
        isset($data['room_positions']) ? $data['room_positions'] : '',
        isset($data['entry_points']) ? $data['entry_points'] : '',
        isset($data['entry_point_positions']) ? $data['entry_point_positions'] : ''
    ];
    
    // If password is provided, update it too (as PIN code)
    if (isset($data['password']) && !empty($data['password'])) {
        $sql .= ", pin_code = ?";
        $params[] = $data['password']; // Store directly as PIN code
    }
    
    // Complete the query
    $sql .= " WHERE id = ?";
    $params[] = $data['id'];
    
    // Execute update
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Check if any rows were affected
    if ($stmt->rowCount() == 0) {
        echo json_encode(['success' => false, 'message' => 'Staff not found or no changes made']);
        exit;
    }
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Staff updated successfully'
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
