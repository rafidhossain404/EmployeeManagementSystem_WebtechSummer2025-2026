<?php
require_once 'hr_config.php';
header('Content-Type: application/json');

$response = [
    'success' => true,
    'total_employees' => 0,
    'pending_leaves' => 0,
    'pending_promotions' => 0,
    'active_employees' => 0,
    'hr_name' => ($_SESSION['first_name'] ?? 'HR') . ' ' . ($_SESSION['last_name'] ?? 'User')
];

// ... rest of your queries
echo json_encode($response);
?>