<?php
// Database connection configuration
function getDBConnection() {
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "worknest_db";

    // Create connection using MySQLi (procedural)
    $conn = mysqli_connect($servername, $username, $password, $dbname);

    // Check connection
    if (!$conn) {
        die("Connection failed: " . mysqli_connect_error());
    }

    // Set charset to UTF-8
    mysqli_set_charset($conn, "utf8");
    
    return $conn;
}

// Get connection - only create once
if (!isset($GLOBALS['conn']) || $GLOBALS['conn'] === null) {
    $GLOBALS['conn'] = getDBConnection();
}

// Create a local variable for direct use
$conn = $GLOBALS['conn'];
?>