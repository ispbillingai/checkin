
<?php
// Start session
session_start();

// Log who is logging out for debugging
if (isset($_SESSION['username'])) {
    error_log("User logging out: " . $_SESSION['username']);
}

// Unset all session variables
$_SESSION = array();

// Destroy the session cookie
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 86400, '/');
}

// Destroy the session
session_destroy();

// Handle both API response and redirect
if (isset($_GET['api']) && $_GET['api'] === 'true') {
    // Return JSON response for API calls
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => 'Logged out successfully'
    ]);
} else {
    // Redirect to login page for browser requests
    header("Location: /src/pages/index.html");
}
exit;
?>
