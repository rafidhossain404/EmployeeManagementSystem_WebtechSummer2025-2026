<?php
require_once 'hr_config.php';
$conn = getDBConnection();
$message = '';
$messageType = '';
$pendingPromotions = [];
$promotionHistory = [];
$filter = isset($_GET['filter']) ? sanitizeInput($_GET['filter']) : 'pending';

// Handle AJAX requests for pending promotions
if (isset($_GET['action']) && $_GET['action'] === 'get_pending') {
    header('Content-Type: application/json');
    
    $promotions = getPendingPromotions($conn);
    echo json_encode([
        'success' => true,
        'promotions' => $promotions
    ]);
    exit();
}

// Handle promotion action (Approve/Reject)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $promotionId = isset($_POST['hr_promotionId']) ? (int)$_POST['hr_promotionId'] : 0;
    $action = isset($_POST['hr_action']) ? sanitizeInput($_POST['hr_action']) : '';
    $newRole = isset($_POST['hr_newRole']) ? sanitizeInput($_POST['hr_newRole']) : '';
    $newSalary = isset($_POST['hr_newSalary']) ? (float)$_POST['hr_newSalary'] : 0;
    
    if (empty($promotionId) || empty($action)) {
        $message = "Missing required parameters!";
        $messageType = "error";
    } else {
        // Get promotion details
        $sql = "SELECT p.*, e.UserName, u.Role, u.Salary 
                FROM Promotion p 
                JOIN Employee e ON p.EmployeeID = e.EmployeeID 
                JOIN User u ON e.UserName = u.UserName 
                WHERE p.PromotionID = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "i", $promotionId);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $promotion = mysqli_fetch_assoc($result);
        
        if (!$promotion) {
            $message = "Promotion request not found!";
            $messageType = "error";
        } else {
            // Start transaction
            mysqli_begin_transaction($conn);
            
            try {
                if ($action === 'Approved') {
                    // Validate new role
                    if (empty($newRole)) {
                        throw new Exception("Please select a new role for the promotion.");
                    }
                    
                    // Update promotion status
                    $sql = "UPDATE Promotion SET Status = 'Approved' WHERE PromotionID = ?";
                    $stmt = mysqli_prepare($conn, $sql);
                    mysqli_stmt_bind_param($stmt, "i", $promotionId);
                    mysqli_stmt_execute($stmt);
                    
                    // Update user role and salary
                    $sql = "UPDATE User SET Role = ?, Salary = ? WHERE UserName = ?";
                    $stmt = mysqli_prepare($conn, $sql);
                    
                    if ($newSalary > 0) {
                        mysqli_stmt_bind_param($stmt, "sds", $newRole, $newSalary, $promotion['UserName']);
                    } else {
                        // Keep current salary if not specified
                        $currentSalary = $promotion['Salary'];
                        mysqli_stmt_bind_param($stmt, "sds", $newRole, $currentSalary, $promotion['UserName']);
                    }
                    mysqli_stmt_execute($stmt);
                    
                    $message = "Promotion approved successfully! {$promotion['UserName']} is now {$newRole}.";
                    $messageType = "success";
                    
                } elseif ($action === 'Rejected') {
                    // Update promotion status to Rejected
                    $sql = "UPDATE Promotion SET Status = 'Rejected' WHERE PromotionID = ?";
                    $stmt = mysqli_prepare($conn, $sql);
                    mysqli_stmt_bind_param($stmt, "i", $promotionId);
                    mysqli_stmt_execute($stmt);
                    
                    $message = "Promotion request rejected.";
                    $messageType = "warning";
                } else {
                    throw new Exception("Invalid action.");
                }
                
                mysqli_commit($conn);
                
            } catch (Exception $e) {
                mysqli_rollback($conn);
                $message = "Error: " . $e->getMessage();
                $messageType = "error";
            }
        }
    }
}

// Get pending promotions
$pendingPromotions = getPendingPromotions($conn);

// Get promotion history
$sql = "SELECT p.*, u.FirstName, u.LastName, u.Role as CurrentRole, u.Dept, u.Salary
        FROM Promotion p 
        JOIN Employee e ON p.EmployeeID = e.EmployeeID 
        JOIN User u ON e.UserName = u.UserName 
        ORDER BY p.PromotionDate DESC 
        LIMIT 50";
$result = mysqli_query($conn, $sql);
if (mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        $promotionHistory[] = $row;
    }
}

// Get all available roles for promotion dropdown
$availableRoles = [
    'Software_Developer' => 'Software Developer',
    'Software_Designer' => 'Software Designer',
    'Software_Tester' => 'Software Tester',
    'Software_Manager' => 'Software Manager',
    'Salesman' => 'Salesman',
    'Digital_Marketing_Specialist' => 'Digital Marketing Specialist',
    'Content_Marketing_Specialist' => 'Content Marketing Specialist',
    'PR_Officer' => 'PR Officer',
    'Marketing_Manager' => 'Marketing Manager',
    'Driver' => 'Driver',
    'Cleaner' => 'Cleaner',
    'Watchman' => 'Watchman',
    'Facilities_Manager' => 'Facilities Manager'
];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Promote Employee - WorkNest</title>
    <link rel="stylesheet" href="hr_dashboard.css">
    <style>
        .hrPromote_container {
            display: grid;
            grid-template-columns: 3fr 2fr;
            gap: 24px;
        }
        
        .hrPromote_card {
            background: #fff;
            border-radius: 16px;
            padding: 24px 28px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        
        .hrPromote_cardTitle {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a2e;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .hrPromote_badge {
            font-size: 12px;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: 600;
        }
        
        .hrPromote_badge_pending {
            background: #fef3c7;
            color: #d97706;
        }
        
        .hrPromote_badge_processing {
            background: #dbeafe;
            color: #2563eb;
        }
        
        .hrPromote_badge_approved {
            background: #d1fae5;
            color: #059669;
        }
        
        .hrPromote_badge_rejected {
            background: #fecaca;
            color: #dc2626;
        }
        
        .hrPromote_item {
            padding: 14px 16px;
            border: 1px solid #f1f5f9;
            border-radius: 10px;
            margin-bottom: 12px;
            transition: all 0.2s ease;
        }
        
        .hrPromote_item:hover {
            border-color: #e2e8f0;
            background: #f8fafc;
        }
        
        .hrPromote_itemHeader {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
        }
        
        .hrPromote_itemName {
            font-weight: 600;
            color: #1a1a2e;
        }
        
        .hrPromote_itemRole {
            font-size: 13px;
            color: #64748b;
        }
        
        .hrPromote_itemDetails {
            font-size: 13px;
            color: #64748b;
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            margin-top: 4px;
        }
        
        .hrPromote_itemActions {
            margin-top: 10px;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            align-items: center;
        }
        
        .hrPromote_itemActions select {
            padding: 6px 10px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            font-size: 13px;
        }
        
        .hrPromote_itemActions input[type="number"] {
            padding: 6px 10px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            font-size: 13px;
            width: 100px;
        }
        
        .hrPromote_table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        
        .hrPromote_table th {
            text-align: left;
            padding: 10px 8px;
            color: #475569;
            font-weight: 600;
            border-bottom: 2px solid #e2e8f0;
        }
        
        .hrPromote_table td {
            padding: 10px 8px;
            border-bottom: 1px solid #f1f5f9;
        }
        
        .hrPromote_table tr:hover td {
            background: #f8fafc;
        }
        
        .hrPromote_empty {
            text-align: center;
            color: #94a3b8;
            padding: 40px 0;
        }
        
        .hrPromote_filter {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;
        }
        
        .hrPromote_filter select,
        .hrPromote_filter input {
            padding: 8px 14px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 13px;
        }
        
        .hrPromote_filter input {
            flex: 1;
        }
        
        @media (max-width: 992px) {
            .hrPromote_container {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <!-- Sidebar -->
    <nav class="hrSidebar">
        <div class="hrSidebar_header">
            <h1 class="hrSidebar_logo">WorkNest</h1>
            <span class="hrSidebar_role">HR Panel</span>
        </div>
        <ul class="hrSidebar_nav">
            <li class="hrSidebar_navItem">
                <a href="hr_dashboard.html" class="hrSidebar_navLink">
                    <span class="hrSidebar_icon">📊</span> Dashboard
                </a>
            </li>
            <li class="hrSidebar_navItem">
                <a href="hr_manage_employees.php" class="hrSidebar_navLink">
                    <span class="hrSidebar_icon">👥</span> Manage Employees
                </a>
            </li>
            <li class="hrSidebar_navItem">
                <a href="hr_recruit.php" class="hrSidebar_navLink">
                    <span class="hrSidebar_icon">➕</span> Recruit Employee
                </a>
            </li>
            <li class="hrSidebar_navItem active">
                <a href="hr_promote.php" class="hrSidebar_navLink">
                    <span class="hrSidebar_icon">⬆️</span> Promote Employee
                </a>
            </li>
            <li class="hrSidebar_navItem">
                <a href="hr_terminate.php" class="hrSidebar_navLink">
                    <span class="hrSidebar_icon">🚫</span> Terminate Employee
                </a>
            </li>
            <li class="hrSidebar_navItem">
                <a href="hr_leave_requests.php" class="hrSidebar_navLink">
                    <span class="hrSidebar_icon">📋</span> Leave Requests
                </a>
            </li>
            <li class="hrSidebar_navItem">
                <a href="hr_update_employee.php" class="hrSidebar_navLink">
                    <span class="hrSidebar_icon">✏️</span> Update Employee
                </a>
            </li>
            <li class="hrSidebar_navItem">
                <a href="../logout.php" class="hrSidebar_navLink logout">
                    <span class="hrSidebar_icon">🚪</span> Logout
                </a>
            </li>
        </ul>
    </nav>

    <!-- Main Content -->
    <main class="hrMain">
        <header class="hrHeader">
            <div class="hrHeader_content">
                <h1 class="hrHeader_title">Promote Employee</h1>
                <p class="hrHeader_subtitle">Review and process promotion requests</p>
            </div>
        </header>

        <?php if ($message): ?>
            <div class="hrForm_message <?php echo $messageType; ?>" style="max-width: 100%; margin-bottom: 20px;">
                <?php echo $message; ?>
            </div>
        <?php endif; ?>

        <div class="hrPromote_container">
            <!-- Pending Promotions -->
            <div class="hrPromote_card">
                <div class="hrPromote_cardTitle">
                    <span>📋 Pending Promotion Requests</span>
                    <span class="hrPromote_badge hrPromote_badge_pending"><?php echo count($pendingPromotions); ?> pending</span>
                </div>
                
                <?php if (count($pendingPromotions) > 0): ?>
                    <?php foreach ($pendingPromotions as $promotion): ?>
                        <div class="hrPromote_item" id="promotion_<?php echo $promotion['PromotionID']; ?>">
                            <div class="hrPromote_itemHeader">
                                <span class="hrPromote_itemName"><?php echo $promotion['FirstName'] . ' ' . $promotion['LastName']; ?></span>
                                <span class="hrPromote_badge <?php echo 'hrPromote_badge_' . strtolower($promotion['Status']); ?>">
                                    <?php echo $promotion['Status']; ?>
                                </span>
                            </div>
                            <div class="hrPromote_itemDetails">
                                <span>📂 <?php echo $promotion['Dept'] ?? 'N/A'; ?></span>
                                <span>👤 Current: <?php echo $promotion['Role'] ?? 'N/A'; ?></span>
                                <span>📅 <?php echo date('M d, Y', strtotime($promotion['PromotionDate'])); ?></span>
                            </div>
                            
                            <form method="POST" action="" onsubmit="return confirmPromotion(event)">
                                <input type="hidden" name="hr_promotionId" value="<?php echo $promotion['PromotionID']; ?>">
                                
                                <div class="hrPromote_itemActions">
                                    <label style="font-size: 13px; color: #475569; font-weight: 500;">New Role:</label>
                                    <select name="hr_newRole" required>
                                        <option value="">Select Role...</option>
                                        <?php foreach ($availableRoles as $key => $label): ?>
                                            <option value="<?php echo $key; ?>"><?php echo $label; ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                    
                                    <label style="font-size: 13px; color: #475569; font-weight: 500;">New Salary:</label>
                                    <input type="number" step="0.01" name="hr_newSalary" placeholder="Optional" min="0">
                                    
                                    <button type="submit" name="hr_action" value="Approved" class="hrAction_btn hrAction_btn_approve">✅ Approve</button>
                                    <button type="submit" name="hr_action" value="Rejected" class="hrAction_btn hrAction_btn_reject">❌ Reject</button>
                                </div>
                            </form>
                        </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <div class="hrPromote_empty">
                        <p style="font-size: 16px;">🎉 No pending promotion requests</p>
                        <p style="font-size: 13px; margin-top: 4px;">All promotion requests have been processed</p>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Promotion History -->
            <div class="hrPromote_card">
                <div class="hrPromote_cardTitle">
                    <span>📜 Promotion History</span>
                    <span class="hrPromote_badge" style="background: #e2e8f0; color: #475569;"><?php echo count($promotionHistory); ?> records</span>
                </div>
                
                <div class="hrPromote_filter">
                    <input type="text" id="hrHistory_search" placeholder="Search by name..." onkeyup="filterHistory()">
                    <select id="hrHistory_filter" onchange="filterHistory()">
                        <option value="all">All Status</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                    </select>
                </div>
                
                <div style="max-height: 400px; overflow-y: auto;">
                    <?php if (count($promotionHistory) > 0): ?>
                        <table class="hrPromote_table" id="hrHistory_table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody id="hrHistory_body">
                                <?php foreach ($promotionHistory as $history): ?>
                                    <tr data-status="<?php echo strtolower($history['Status']); ?>" data-name="<?php echo strtolower($history['FirstName'] . ' ' . $history['LastName']); ?>">
                                        <td><strong><?php echo $history['FirstName'] . ' ' . $history['LastName']; ?></strong></td>
                                        <td><?php echo $history['Dept'] ?? 'N/A'; ?></td>
                                        <td>
                                            <span class="hrPromote_badge <?php echo 'hrPromote_badge_' . strtolower($history['Status']); ?>">
                                                <?php echo $history['Status']; ?>
                                            </span>
                                        </td>
                                        <td><?php echo date('M d, Y', strtotime($history['PromotionDate'])); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php else: ?>
                        <div class="hrPromote_empty">
                            <p>No promotion history available</p>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </main>

    <script>
        function confirmPromotion(event) {
            const form = event.target;
            const action = form.querySelector('button[type="submit"][clicked]');
            if (!action) return true;
            
            const actionValue = action.value;
            const role = form.querySelector('select[name="hr_newRole"]').value;
            
            if (actionValue === 'Approved' && !role) {
                alert('Please select a new role for the promotion.');
                return false;
            }
            
            const message = actionValue === 'Approved' 
                ? 'Are you sure you want to APPROVE this promotion? The employee will be promoted to the selected role.'
                : 'Are you sure you want to REJECT this promotion request?';
            
            return confirm(message);
        }

        // Track which button was clicked
        document.querySelectorAll('.hrPromote_itemActions button[type="submit"]').forEach(btn => {
            btn.addEventListener('click', function() {
                const form = this.closest('form');
                form.querySelectorAll('button[type="submit"]').forEach(b => b.removeAttribute('clicked'));
                this.setAttribute('clicked', 'true');
            });
        });

        function filterHistory() {
            const search = document.getElementById('hrHistory_search').value.toLowerCase();
            const status = document.getElementById('hrHistory_filter').value;
            const rows = document.querySelectorAll('#hrHistory_body tr');
            
            rows.forEach(row => {
                const name = row.getAttribute('data-name') || '';
                const rowStatus = row.getAttribute('data-status') || '';
                
                const statusMatch = status === 'all' || rowStatus === status;
                const searchMatch = name.includes(search);
                
                row.style.display = (statusMatch && searchMatch) ? '' : 'none';
            });
        }

        // Auto-refresh pending promotions every 30 seconds
        setTimeout(function() {
            location.reload();
        }, 30000);
    </script>
</body>
</html>