<?php
// Database connection configuration
function getDBConnection() {
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "worknest_db";

    $conn = mysqli_connect($servername, $username, $password, $dbname);

    if (!$conn) {
        die("Connection failed: " . mysqli_connect_error());
    }

    mysqli_set_charset($conn, "utf8");
    return $conn;
}

// Create global connection
$GLOBALS['conn'] = getDBConnection();

// Also create a local variable for direct use
$conn = $GLOBALS['conn'];
?>