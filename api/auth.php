
<?php
// Include database configuration
require_once 'db_config.php';

// Start session
session_start();

// Handle login request
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get username and password from POST data
    $username = secure_input($_POST['username']);
    $password = $_POST['password']; // Password will be hashed for comparison
    
    // Prepare SQL statement to prevent SQL injection
    $stmt = $conn->prepare("SELECT id, username, password, is_admin FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows == 1) {
        $user = $result->fetch_assoc();
        
        // Verify password (assuming passwords are stored as hashes)
        if (password_verify($password, $user['password'])) {
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
} else {
    // Return error for non-POST requests
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}

// Close database connection
$conn->close();
?>
