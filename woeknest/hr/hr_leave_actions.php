<?php
require_once '../includes/db_connection.php';
require_once '../includes/session_check.php';
require_once '../includes/functions.php';
$conn = getDBConnection();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit();
}

$leaveId = isset($_POST['leave_id']) ? (int)$_POST['leave_id'] : 0;
$action = isset($_POST['action']) ? sanitizeInput($_POST['action']) : '';

if (empty($leaveId) || empty($action)) {
    echo json_encode(['success' => false, 'message' => 'Missing required parameters']);
    exit();
}

$validActions = ['Accepted', 'Rejected', 'Processing'];
if (!in_array($action, $validActions)) {
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
    exit();
}

// Update leave status
$sql = "UPDATE `Leave` SET Status = ? WHERE LeaveID = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "si", $action, $leaveId);

if (mysqli_stmt_execute($stmt)) {
    // If leave is accepted, update user status to 'On_leave'
    if ($action === 'Accepted') {
        $sql = "SELECT UserName FROM `Leave` WHERE LeaveID = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "i", $leaveId);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if ($row = mysqli_fetch_assoc($result)) {
            $userName = $row['UserName'];
            $sql = "UPDATE User SET Status = 'On_leave' WHERE UserName = ?";
            $stmt = mysqli_prepare($conn, $sql);
            mysqli_stmt_bind_param($stmt, "s", $userName);
            mysqli_stmt_execute($stmt);
        }
    }
    
    echo json_encode(['success' => true, 'message' => "Leave request {$action} successfully"]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error updating leave request: ' . mysqli_error($conn)]);
}

mysqli_close($conn);
?>