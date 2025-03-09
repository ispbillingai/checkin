
<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start session with error checking
if (!session_start()) {
    error_log("Failed to start session in auth.php");
}

// Include database configuration
require_once 'db_config.php';

// Directly authenticate demo users for testing
if (isset($_POST['username']) && 
    ($_POST['username'] === 'admin' && $_POST['password'] === 'admin' || 
     $_POST['username'] === 'user' && $_POST['password'] === 'user')) {
    
    error_log("Demo login detected for: " . $_POST['username']);
    
    // Set session variables for demo users
    $_SESSION['user_id'] = ($_POST['username'] === 'admin') ? 1 : 2;
    $_SESSION['username'] = $_POST['username'];
    $_SESSION['is_admin'] = ($_POST['username'] === 'admin') ? 1 : 0;
    
    // Return success JSON
    echo json_encode([
        'success' => true,
        'isAdmin' => ($_POST['username'] === 'admin'),
        'message' => 'Login successful',
        'demo' => true
    ]);
    exit;
}

// Handle login request
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    error_log("Received POST request to auth.php");
    
    // Log received data (sanitized)
    $username = isset($_POST['username']) ? htmlspecialchars($_POST['username']) : '';
    error_log("Login attempt for username: " . $username);
    
    // Prepare SQL statement to prevent SQL injection
    try {
        $stmt = $conn->prepare("SELECT id, username, password, is_admin FROM users WHERE username = ?");
        if (!$stmt) {
            error_log("Failed to prepare statement: " . $conn->error);
            throw new Exception("Database prepare failed");
        }
        
        $stmt->bind_param("s", $username);
        if (!$stmt->execute()) {
            error_log("Failed to execute statement: " . $stmt->error);
            throw new Exception("Database execute failed");
        }
        
        $result = $stmt->get_result();
        error_log("Query executed successfully. Found rows: " . $result->num_rows);
        
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
                    'message' => 'Login successful'
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
        error_log("Exception in auth.php: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Server error occurred'
        ]);
    }
} else {
    error_log("Invalid request method to auth.php: " . $_SERVER["REQUEST_METHOD"]);
    // Return error for non-POST requests
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}

$conn->close();
error_log("Connection closed in auth.php");
?>
