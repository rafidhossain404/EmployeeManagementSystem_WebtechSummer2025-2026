<?php
require_once 'hr_config.php';

// Use the global connection
global $conn;
$conn = $GLOBALS['conn'];

header('Content-Type: application/json');

// Debug - log any errors
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Handle employee overview request
if (isset($_GET['action']) && $_GET['action'] === 'get_employees') {
    // Query strictly excludes HR by Role and by Department
    $sql = "SELECT FirstName, LastName, Role, Dept, Status 
            FROM User 
            WHERE Role NOT IN ('HR') 
            AND Dept NOT IN ('HR')
            ORDER BY FirstName";
    
    $result = mysqli_query($conn, $sql);
    
    // Check if query failed
    if (!$result) {
        echo json_encode([
            'success' => false,
            'error' => mysqli_error($conn),
            'employees' => []
        ]);
        exit();
    }
    
    $employees = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $employees[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'employees' => $employees,
        'count' => count($employees)
    ]);
    exit();
}

// Regular dashboard data
$response = [
    'success' => true,
    'total_employees' => 0,
    'pending_leaves' => 0,
    'pending_promotions' => 0,
    'active_employees' => 0,
    'hr_name' => ($_SESSION['first_name'] ?? 'HR') . ' ' . ($_SESSION['last_name'] ?? 'User')
];

// Get total employees count
$sql = "SELECT COUNT(*) as count FROM Employee";
$result = mysqli_query($conn, $sql);
if ($row = mysqli_fetch_assoc($result)) {
    $response['total_employees'] = (int)$row['count'];
}

// Get pending leaves count
$sql = "SELECT COUNT(*) as count FROM `Leave` WHERE Status IN ('Pending', 'Processing')";
$result = mysqli_query($conn, $sql);
if ($row = mysqli_fetch_assoc($result)) {
    $response['pending_leaves'] = (int)$row['count'];
}

// Get pending promotions count
$sql = "SELECT COUNT(*) as count FROM Promotion WHERE Status IN ('Pending', 'Processing')";
$result = mysqli_query($conn, $sql);
if ($row = mysqli_fetch_assoc($result)) {
    $response['pending_promotions'] = (int)$row['count'];
}

// Get active employees count (Excludes HR)
$sql = "SELECT COUNT(*) as count FROM User WHERE Status = 'Active' AND Role NOT IN ('HR')";
$result = mysqli_query($conn, $sql);
if ($row = mysqli_fetch_assoc($result)) {
    $response['active_employees'] = (int)$row['count'];
}

echo json_encode($response);
?>