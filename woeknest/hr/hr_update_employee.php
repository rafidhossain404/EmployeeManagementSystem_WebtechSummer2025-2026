<?php
require_once 'hr_config.php';
$conn = getDBConnection();
$message = '';
$messageType = '';
$employeeData = null;
$employeeId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

// If employee ID is provided, fetch the employee data
if ($employeeId > 0) {
    $employeeData = getEmployeeById($conn, $employeeId);
}

// Handle update
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['hr_update'])) {
    $employeeId = (int)$_POST['hr_employeeId'];
    $firstName = sanitizeInput($_POST['hr_firstName'] ?? '');
    $lastName = sanitizeInput($_POST['hr_lastName'] ?? '');
    $email = sanitizeInput($_POST['hr_email'] ?? '');
    $phone = sanitizeInput($_POST['hr_phone'] ?? '');
    $address = sanitizeInput($_POST['hr_address'] ?? '');
    $dept = sanitizeInput($_POST['hr_dept'] ?? '');
    $salary = sanitizeInput($_POST['hr_salary'] ?? '');
    $status = sanitizeInput($_POST['hr_status'] ?? '');
    $managerId = !empty($_POST['hr_managerId']) ? (int)$_POST['hr_managerId'] : null;

    // Validate
    if (empty($firstName) || empty($lastName) || empty($email) || empty($phone) || empty($address) || empty($dept) || empty($salary) || empty($status)) {
        $message = "All fields are required!";
        $messageType = "error";
    } else {
        // Get username from employee
        $sql = "SELECT UserName FROM Employee WHERE EmployeeID = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "i", $employeeId);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $row = mysqli_fetch_assoc($result);
        $userName = $row['UserName'];

        // Update User table
        $sql = "UPDATE User SET FirstName = ?, LastName = ?, Email = ?, Phone = ?, Address = ?, Dept = ?, Salary = ?, Status = ? WHERE UserName = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssssssdss", $firstName, $lastName, $email, $phone, $address, $dept, $salary, $status, $userName);

        if (mysqli_stmt_execute($stmt)) {
            // Update Employee's manager
            $sql = "UPDATE Employee SET ManagerID = ? WHERE EmployeeID = ?";
            $stmt = mysqli_prepare($conn, $sql);
            mysqli_stmt_bind_param($stmt, "ii", $managerId, $employeeId);
            mysqli_stmt_execute($stmt);

            $message = "Employee updated successfully!";
            $messageType = "success";
            
            // Refresh employee data
            $employeeData = getEmployeeById($conn, $employeeId);
        } else {
            $message = "Error updating employee: " . mysqli_error($conn);
            $messageType = "error";
        }
    }
}

// Get managers for dropdown
$managers = getAllManagers($conn);

// Get all employees for dropdown
$employees = [];
$sql = "SELECT e.EmployeeID, u.FirstName, u.LastName, u.Role, u.Status 
        FROM Employee e 
        JOIN User u ON e.UserName = u.UserName 
        WHERE u.Role NOT IN ('HR')
        ORDER BY u.FirstName";
$result = mysqli_query($conn, $sql);
if (mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        $employees[] = $row;
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Update Employee - WorkNest</title>
    <link rel="stylesheet" href="hr_dashboard.css">
    <style>
        .hrUpdate_container {
            max-width: 900px;
            margin: 0 auto;
        }
        
        .hrUpdate_card {
            background: #fff;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06);
            margin-bottom: 24px;
        }
        
        .hrUpdate_cardTitle {
            font-size: 20px;
            font-weight: 700;
            color: #1a1a2e;
            margin-bottom: 8px;
        }
        
        .hrUpdate_cardSubtitle {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 24px;
        }
        
        .hrUpdate_sectionTitle {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a2e;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e2e8f0;
        }
        
        .hrUpdate_selectEmployee {
            width: 100%;
            padding: 10px 14px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            margin-bottom: 16px;
        }
        
        .hrUpdate_selectEmployee:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .hrUpdate_form {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }
        
        .hrUpdate_form .full {
            grid-column: 1 / -1;
        }
        
        .hrUpdate_label {
            font-size: 13px;
            font-weight: 500;
            color: #475569;
            margin-bottom: 4px;
            display: block;
        }
        
        .hrUpdate_input {
            width: 100%;
            padding: 10px 14px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.2s ease;
        }
        
        .hrUpdate_input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .hrUpdate_input:disabled {
            background: #f1f5f9;
            color: #94a3b8;
            cursor: not-allowed;
        }
        
        .hrUpdate_submit {
            padding: 12px 32px;
            background: #667eea;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s ease;
            grid-column: 1 / -1;
        }
        
        .hrUpdate_submit:hover {
            background: #5a6fd6;
        }
        
        .hrForm_message {
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-weight: 500;
        }
        
        .hrForm_message.success {
            background: #d1fae5;
            color: #059669;
        }
        
        .hrForm_message.error {
            background: #fecaca;
            color: #dc2626;
        }
        
        .hrUpdate_infoBox {
            background: #f8fafc;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 20px;
            border-left: 4px solid #667eea;
        }
        
        .hrUpdate_infoBox p {
            margin: 4px 0;
            font-size: 14px;
            color: #475569;
        }
        
        .hrUpdate_infoBox strong {
            color: #1a1a2e;
        }
        
        .hrUpdate_notFound {
            text-align: center;
            padding: 40px 0;
            color: #94a3b8;
        }
        
        .hrUpdate_notFound a {
            color: #667eea;
            text-decoration: none;
        }
        
        .hrUpdate_notFound a:hover {
            text-decoration: underline;
        }

        @media (max-width: 640px) {
            .hrUpdate_form {
                grid-template-columns: 1fr;
            }
            
            .hrUpdate_form .full {
                grid-column: 1;
            }
            
            .hrUpdate_submit {
                grid-column: 1;
            }
            
            .hrUpdate_card {
                padding: 20px;
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
        <div class="hrUpdate_container">
            <div class="hrUpdate_card">
                <h1 class="hrUpdate_cardTitle">✏️ Update Employee</h1>
                <p class="hrUpdate_cardSubtitle">Select an employee to edit their information</p>
                
                <?php if ($message): ?>
                    <div class="hrForm_message <?php echo $messageType; ?>">
                        <?php echo $message; ?>
                    </div>
                <?php endif; ?>
                
                <!-- Employee Selection -->
                <?php if (!$employeeData && count($employees) > 0): ?>
                    <div class="hrUpdate_sectionTitle">📋 Select Employee to Edit</div>
                    <form method="GET" action="">
                        <select name="id" class="hrUpdate_selectEmployee" onchange="this.form.submit()">
                            <option value="">-- Select an employee --</option>
                            <?php foreach ($employees as $emp): ?>
                                <option value="<?php echo $emp['EmployeeID']; ?>">
                                    <?php echo $emp['FirstName'] . ' ' . $emp['LastName'] . ' (' . $emp['Role'] . ') - ' . $emp['Status']; ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </form>
                <?php endif; ?>
                
                <!-- Employee Edit Form -->
                <?php if ($employeeData): ?>
                    <div class="hrUpdate_infoBox">
                        <p><strong>Employee ID:</strong> <?php echo $employeeData['EmployeeID']; ?></p>
                        <p><strong>Username:</strong> <?php echo htmlspecialchars($employeeData['UserName']); ?></p>
                        <p><strong>Current Role:</strong> <?php echo htmlspecialchars($employeeData['Role']); ?></p>
                    </div>
                    
                    <form method="POST" action="">
                        <input type="hidden" name="hr_employeeId" value="<?php echo $employeeData['EmployeeID']; ?>">
                        <input type="hidden" name="hr_update" value="1">
                        
                        <div class="hrUpdate_form">
                            <!-- Username - Read Only -->
                            <div class="full">
                                <label class="hrUpdate_label">Username (Cannot be changed)</label>
                                <input type="text" class="hrUpdate_input" value="<?php echo htmlspecialchars($employeeData['UserName']); ?>" disabled>
                            </div>
                            
                            <div>
                                <label class="hrUpdate_label">First Name</label>
                                <input type="text" name="hr_firstName" class="hrUpdate_input" value="<?php echo htmlspecialchars($employeeData['FirstName']); ?>" required>
                            </div>
                            <div>
                                <label class="hrUpdate_label">Last Name</label>
                                <input type="text" name="hr_lastName" class="hrUpdate_input" value="<?php echo htmlspecialchars($employeeData['LastName']); ?>" required>
                            </div>
                            <div>
                                <label class="hrUpdate_label">Email</label>
                                <input type="email" name="hr_email" class="hrUpdate_input" value="<?php echo htmlspecialchars($employeeData['Email']); ?>" required>
                            </div>
                            <div>
                                <label class="hrUpdate_label">Phone</label>
                                <input type="tel" name="hr_phone" class="hrUpdate_input" value="<?php echo htmlspecialchars($employeeData['Phone']); ?>" required>
                            </div>
                            <div class="full">
                                <label class="hrUpdate_label">Address</label>
                                <input type="text" name="hr_address" class="hrUpdate_input" value="<?php echo htmlspecialchars($employeeData['Address']); ?>" required>
                            </div>
                            <div>
                                <label class="hrUpdate_label">Department</label>
                                <select name="hr_dept" class="hrUpdate_input" required>
                                    <option value="Software" <?php echo ($employeeData['Dept'] === 'Software') ? 'selected' : ''; ?>>Software</option>
                                    <option value="Marketing" <?php echo ($employeeData['Dept'] === 'Marketing') ? 'selected' : ''; ?>>Marketing</option>
                                    <option value="Facilities" <?php echo ($employeeData['Dept'] === 'Facilities') ? 'selected' : ''; ?>>Facilities</option>
                                    <option value="HR" <?php echo ($employeeData['Dept'] === 'HR') ? 'selected' : ''; ?>>HR</option>
                                </select>
                            </div>
                            <div>
                                <label class="hrUpdate_label">Salary</label>
                                <input type="number" step="0.01" name="hr_salary" class="hrUpdate_input" value="<?php echo $employeeData['Salary']; ?>" required>
                            </div>
                            <div>
                                <label class="hrUpdate_label">Status</label>
                                <select name="hr_status" class="hrUpdate_input" required>
                                    <option value="Active" <?php echo ($employeeData['Status'] === 'Active') ? 'selected' : ''; ?>>Active</option>
                                    <option value="Inactive" <?php echo ($employeeData['Status'] === 'Inactive') ? 'selected' : ''; ?>>Inactive</option>
                                    <option value="On_leave" <?php echo ($employeeData['Status'] === 'On_leave') ? 'selected' : ''; ?>>On Leave</option>
                                </select>
                            </div>
                            <div>
                                <label class="hrUpdate_label">Manager</label>
                                <select name="hr_managerId" class="hrUpdate_input">
                                    <option value="">No Manager</option>
                                    <?php foreach ($managers as $manager): ?>
                                        <option value="<?php echo $manager['ManagerID']; ?>" <?php echo ($employeeData['ManagerID'] == $manager['ManagerID']) ? 'selected' : ''; ?>>
                                            <?php echo htmlspecialchars($manager['FirstName'] . ' ' . $manager['LastName']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <button type="submit" class="hrUpdate_submit">💾 Update Employee</button>
                        </div>
                    </form>
                    
                    <div style="margin-top: 16px; text-align: center;">
                        <a href="hr_update_employee.php" style="color: #667eea; text-decoration: none;">← Select another employee</a>
                    </div>
                    
                <?php elseif (!isset($_GET['id']) && count($employees) === 0): ?>
                    <div class="hrUpdate_notFound">
                        <p style="font-size: 48px; margin-bottom: 16px;">👥</p>
                        <p style="font-size: 18px;">No employees found</p>
                        <p style="font-size: 14px; margin-top: 8px;">Please recruit an employee first.</p>
                        <p style="margin-top: 16px;"><a href="hr_recruit.php" style="color: #667eea; text-decoration: none;">➕ Recruit Employee</a></p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </main>
</body>
</html>