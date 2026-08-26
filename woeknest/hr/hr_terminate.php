<?php
require_once 'hr_config.php';
$conn = getDBConnection();
$message = '';
$messageType = '';
$employeeToTerminate = null;

// Get employee ID from URL
$employeeId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($employeeId > 0) {
    $employeeToTerminate = getEmployeeById($conn, $employeeId);
}

// Handle termination
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['hr_terminate'])) {
    $employeeId = (int)$_POST['hr_employeeId'];
    
    // Update user status to 'Inactive'
    $sql = "UPDATE User SET Status = 'Inactive' WHERE UserName = (SELECT UserName FROM Employee WHERE EmployeeID = ?)";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $employeeId);
    
    if (mysqli_stmt_execute($stmt)) {
        $message = "Employee terminated successfully!";
        $messageType = "success";
        $employeeToTerminate = null;
    } else {
        $message = "Error terminating employee: " . mysqli_error($conn);
        $messageType = "error";
    }
}

// Get all active employees for dropdown
$employees = getAllActiveEmployees($conn);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terminate Employee - WorkNest</title>
    <link rel="stylesheet" href="hr_dashboard.css">
    <style>
        .hrTerminate_container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
        }
        
        .hrTerminate_card {
            background: #fff;
            border-radius: 16px;
            padding: 24px 32px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        
        .hrTerminate_employeeInfo {
            margin: 16px 0;
            padding: 16px;
            background: #f8fafc;
            border-radius: 8px;
        }
        
        .hrTerminate_employeeInfo p {
            margin: 6px 0;
            font-size: 14px;
        }
        
        .hrTerminate_employeeInfo strong {
            color: #475569;
        }
        
        .hrTerminate_confirmBtn {
            padding: 12px 32px;
            background: #dc2626;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s ease;
            margin-top: 16px;
        }
        
        .hrTerminate_confirmBtn:hover {
            background: #b91c1c;
        }
        
        .hrTerminate_select {
            width: 100%;
            padding: 10px 14px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            margin-bottom: 16px;
        }
        
        @media (max-width: 768px) {
            .hrTerminate_container {
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
    <li class="hrSidebar_navItem active">
        <a href="hr_dashboard.html" class="hrSidebar_navLink">
            <span class="hrSidebar_icon">📊</span>
            Dashboard
        </a>
    </li>
    <li class="hrSidebar_navItem">
        <a href="hr_update_employee.php" class="hrSidebar_navLink">
            <span class="hrSidebar_icon">✏️</span>
            Update Employee
        </a>
    </li>
    <li class="hrSidebar_navItem">
        <a href="hr_recruit.php" class="hrSidebar_navLink">
            <span class="hrSidebar_icon">➕</span>
            Recruit Employee
        </a>
    </li>
    <li class="hrSidebar_navItem">
        <a href="hr_promote.php" class="hrSidebar_navLink">
            <span class="hrSidebar_icon">⬆️</span>
            Promote Employee
        </a>
    </li>
    <li class="hrSidebar_navItem">
        <a href="hr_terminate.php" class="hrSidebar_navLink">
            <span class="hrSidebar_icon">🚫</span>
            Terminate Employee
        </a>
    </li>
    <li class="hrSidebar_navItem">
        <a href="hr_leave_requests.php" class="hrSidebar_navLink">
            <span class="hrSidebar_icon">📋</span>
            Leave Requests
        </a>
    </li>
    <li class="hrSidebar_navItem">
        <a href="../logout.php" class="hrSidebar_navLink logout">
            <span class="hrSidebar_icon">🚪</span>
            Logout
        </a>
    </li>
</ul>
    </nav>

    <!-- Main Content -->
    <main class="hrMain">
        <header class="hrHeader">
            <div class="hrHeader_content">
                <h1 class="hrHeader_title">Terminate Employee</h1>
                <p class="hrHeader_subtitle">Search and terminate an employee</p>
            </div>
        </header>

        <?php if ($message): ?>
            <div class="hrForm_message <?php echo $messageType; ?>" style="max-width: 800px; margin-bottom: 20px;">
                <?php echo $message; ?>
            </div>
        <?php endif; ?>

        <div class="hrTerminate_container">
            <!-- Search/Select Employee -->
            <div class="hrTerminate_card">
                <h3 style="margin-bottom: 16px;">Select Employee</h3>
                <form method="GET" action="">
                    <select name="id" class="hrTerminate_select" onchange="this.form.submit()">
                        <option value="">Select an employee...</option>
                        <?php foreach ($employees as $emp): ?>
                            <option value="<?php echo $emp['EmployeeID']; ?>" <?php echo ($employeeId == $emp['EmployeeID']) ? 'selected' : ''; ?>>
                                <?php echo $emp['FirstName'] . ' ' . $emp['LastName'] . ' (' . $emp['Role'] . ')'; ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </form>
                
                <?php if (count($employees) === 0): ?>
                    <p style="color: #64748b;">No active employees found to terminate.</p>
                <?php endif; ?>
            </div>

            <!-- Employee Details & Termination -->
            <div class="hrTerminate_card">
                <h3 style="margin-bottom: 16px;">Employee Details</h3>
                
                <?php if ($employeeToTerminate): ?>
                    <div class="hrTerminate_employeeInfo">
                        <p><strong>Name:</strong> <?php echo $employeeToTerminate['FirstName'] . ' ' . $employeeToTerminate['LastName']; ?></p>
                        <p><strong>Email:</strong> <?php echo $employeeToTerminate['Email']; ?></p>
                        <p><strong>Department:</strong> <?php echo $employeeToTerminate['Dept']; ?></p>
                        <p><strong>Role:</strong> <?php echo $employeeToTerminate['Role']; ?></p>
                        <p><strong>Status:</strong> <span class="hrPage_status_active"><?php echo $employeeToTerminate['Status']; ?></span></p>
                    </div>
                    
                    <form method="POST" action="" onsubmit="return confirm('Are you sure you want to terminate this employee? This action cannot be undone.')">
                        <input type="hidden" name="hr_employeeId" value="<?php echo $employeeToTerminate['EmployeeID']; ?>">
                        <button type="submit" name="hr_terminate" class="hrTerminate_confirmBtn">🚫 Terminate Employee</button>
                    </form>
                <?php else: ?>
                    <p style="color: #94a3b8;">Select an employee from the list to view details.</p>
                <?php endif; ?>
            </div>
        </div>
    </main>
</body>
</html>