
<?php
// Start session
if (!session_start()) {
    // Failed to start session
}

// Include database configuration
require_once 'db_config.php';

// Directly authenticate demo users for testing
if (isset($_POST['username']) && 
    ($_POST['username'] === 'admin' && $_POST['password'] === 'admin' || 
     $_POST['username'] === 'user' && $_POST['password'] === 'user')) {
    
    // Set session variables for demo users
    $_SESSION['user_id'] = ($_POST['username'] === 'admin') ? 1 : 2;
    $_SESSION['username'] = $_POST['username'];
    $_SESSION['is_admin'] = ($_POST['username'] === 'admin') ? 1 : 0;
    $_SESSION['demo_user'] = true;
    
    // Return success JSON
    echo json_encode([
        'success' => true,
        'isAdmin' => ($_POST['username'] === 'admin'),
        'message' => 'Login successful',
        'demo' => true,
        'sessionId' => session_id() // Include session ID for debugging
    ]);
    exit;
}

// Handle login request
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Log received data (sanitized)
    $username = isset($_POST['username']) ? htmlspecialchars($_POST['username']) : '';
    
    // Prepare SQL statement to prevent SQL injection
    try {
        $stmt = $conn->prepare("SELECT id, username, password, is_admin FROM users WHERE username = ?");
        if (!$stmt) {
            throw new Exception("Database prepare failed");
        }
        
        $stmt->bind_param("s", $username);
        if (!$stmt->execute()) {
            throw new Exception("Database execute failed");
        }
        
        $result = $stmt->get_result();
        
        if ($result->num_rows == 1) {
            $user = $result->fetch_assoc();
            
            // Verify password (assuming passwords are stored as hashes)
            if (password_verify($_POST['password'], $user['password'])) {
                // Set session variables
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['is_admin'] = $user['is_admin'];
                
                // Return success JSON
                echo json_encode([
                    'success' => true,
                    'isAdmin' => (bool)$user['is_admin'],
                    'message' => 'Login successful',
                    'sessionId' => session_id() // Include session ID for debugging
                ]);
                exit;
            }
        }
        
        // Return error JSON if authentication fails
        echo json_encode([
            'success' => false,
            'message' => 'Invalid username or password'
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Server error occurred'
        ]);
    }
} else {
    // Return error for non-POST requests
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}

$conn->close();
?>
