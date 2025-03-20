
<?php
// Include database configuration
require_once '../php/db_config.php';

// Set response headers
header('Content-Type: application/json');

// Get JSON POST data
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

if (!$data || !isset($data['username']) || !isset($data['password'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Username and password are required'
    ]);
    exit;
}

$username = $data['username'];
$password = $data['password'];

// Prepare SQL to get user with admin privileges
$stmt = $conn->prepare("SELECT id, username, password, is_admin FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid username or password'
    ]);
    exit;
}

$user = $result->fetch_assoc();

// Verify password and admin status
if (password_verify($password, $user['password']) && $user['is_admin'] == 1) {
    // Generate a simple token (in a real app, use a proper JWT library)
    $token = bin2hex(random_bytes(32));
    
    echo json_encode([
        'success' => true,
        'token' => $token,
        'user_id' => $user['id'],
        'username' => $user['username']
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid username or password or insufficient privileges'
    ]);
}
?>
