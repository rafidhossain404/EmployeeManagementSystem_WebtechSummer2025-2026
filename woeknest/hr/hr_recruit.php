<?php
require_once 'hr_config.php';
$conn = getDBConnection();
$message = '';
$messageType = '';

// Get managers for dropdown
$managers = [];
$sql = "SELECT m.ManagerID, u.UserName, u.FirstName, u.LastName 
        FROM Manager m 
        JOIN User u ON m.UserName = u.UserName 
        WHERE u.Status = 'Active'";
$result = mysqli_query($conn, $sql);
if (mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        $managers[] = $row;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $userName = sanitizeInput($_POST['hr_userName'] ?? '');
    $password = sanitizeInput($_POST['hr_password'] ?? '');
    $firstName = sanitizeInput($_POST['hr_firstName'] ?? '');
    $lastName = sanitizeInput($_POST['hr_lastName'] ?? '');
    $dob = sanitizeInput($_POST['hr_dob'] ?? '');
    $gender = sanitizeInput($_POST['hr_gender'] ?? '');
    $email = sanitizeInput($_POST['hr_email'] ?? '');
    $phone = sanitizeInput($_POST['hr_phone'] ?? '');
    $address = sanitizeInput($_POST['hr_address'] ?? '');
    $role = sanitizeInput($_POST['hr_role'] ?? '');
    $dept = sanitizeInput($_POST['hr_dept'] ?? '');
    $salary = sanitizeInput($_POST['hr_salary'] ?? '');
    $joinDate = sanitizeInput($_POST['hr_joinDate'] ?? date('Y-m-d'));
    $managerId = !empty($_POST['hr_managerId']) ? (int)$_POST['hr_managerId'] : null;

    // Validate required fields
    if (empty($userName) || empty($password) || empty($firstName) || empty($lastName) || 
        empty($dob) || empty($gender) || empty($email) || empty($phone) || 
        empty($address) || empty($role) || empty($dept) || empty($salary)) {
        $message = "All fields are required!";
        $messageType = "error";
    } else {
        // Check if username already exists
        $checkSql = "SELECT UserName FROM User WHERE UserName = ?";
        $checkStmt = mysqli_prepare($conn, $checkSql);
        mysqli_stmt_bind_param($checkStmt, "s", $userName);
        mysqli_stmt_execute($checkStmt);
        $checkResult = mysqli_stmt_get_result($checkStmt);
        
        if (mysqli_num_rows($checkResult) > 0) {
            $message = "Username already exists!";
            $messageType = "error";
        } else {
            // Check if email already exists
            $checkSql = "SELECT Email FROM User WHERE Email = ?";
            $checkStmt = mysqli_prepare($conn, $checkSql);
            mysqli_stmt_bind_param($checkStmt, "s", $email);
            mysqli_stmt_execute($checkStmt);
            $checkResult = mysqli_stmt_get_result($checkStmt);
            
            if (mysqli_num_rows($checkResult) > 0) {
                $message = "Email already exists!";
                $messageType = "error";
            } else {
                // Start transaction
                mysqli_begin_transaction($conn);
                
                try {
                    // Insert into User table
                    $sql = "INSERT INTO User (UserName, Password, Role, Dept, Salary, FirstName, LastName, DOB, Gender, Email, Phone, Address, JoinDate, Status) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')";
                    $stmt = mysqli_prepare($conn, $sql);
                    mysqli_stmt_bind_param($stmt, "sssssssssssss", $userName, $password, $role, $dept, $salary, $firstName, $lastName, $dob, $gender, $email, $phone, $address, $joinDate);
                    
                    if (!mysqli_stmt_execute($stmt)) {
                        throw new Exception("Error inserting user: " . mysqli_error($conn));
                    }
                    
                    // Insert into Employee table
                    $sql = "INSERT INTO Employee (UserName, ManagerID) VALUES (?, ?)";
                    $stmt = mysqli_prepare($conn, $sql);
                    mysqli_stmt_bind_param($stmt, "si", $userName, $managerId);
                    
                    if (!mysqli_stmt_execute($stmt)) {
                        throw new Exception("Error inserting employee: " . mysqli_error($conn));
                    }
                    
                    mysqli_commit($conn);
                    $message = "Employee recruited successfully!";
                    $messageType = "success";
                    
                    // Clear form data
                    $_POST = [];
                } catch (Exception $e) {
                    mysqli_rollback($conn);
                    $message = "Error: " . $e->getMessage();
                    $messageType = "error";
                }
            }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recruit Employee - WorkNest</title>
    <link rel="stylesheet" href="hr_dashboard.css">
    <style>
        .hrForm {
            background: #fff;
            border-radius: 16px;
            padding: 24px 32px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06);
            max-width: 800px;
        }
        
        .hrForm_grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .hrForm_group {
            display: flex;
            flex-direction: column;
        }
        
        .hrForm_group.full {
            grid-column: 1 / -1;
        }
        
        .hrForm_label {
            font-size: 14px;
            font-weight: 500;
            color: #475569;
            margin-bottom: 6px;
        }
        
        .hrForm_label .required {
            color: #dc2626;
        }
        
        .hrForm_input {
            padding: 10px 14px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.2s ease;
        }
        
        .hrForm_input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .hrForm_input.error {
            border-color: #dc2626;
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
        
        .hrForm_submit {
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
        
        .hrForm_submit:hover {
            background: #5a6fd6;
        }
        
        @media (max-width: 640px) {
            .hrForm_grid {
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
            <li class="hrSidebar_navItem active">
                <a href="hr_recruit.php" class="hrSidebar_navLink">
                    <span class="hrSidebar_icon">➕</span> Recruit Employee
                </a>
            </li>
            <li class="hrSidebar_navItem">
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
                <h1 class="hrHeader_title">Recruit Employee</h1>
                <p class="hrHeader_subtitle">Add a new employee to the system</p>
            </div>
        </header>

        <div class="hrForm">
            <?php if ($message): ?>
                <div class="hrForm_message <?php echo $messageType; ?>">
                    <?php echo $message; ?>
                </div>
            <?php endif; ?>

            <form method="POST" action="">
                <div class="hrForm_grid">
                    <div class="hrForm_group">
                        <label class="hrForm_label" for="hr_userName">Username <span class="required">*</span></label>
                        <input type="text" id="hr_userName" name="hr_userName" class="hrForm_input" value="<?php echo $_POST['hr_userName'] ?? ''; ?>" required>
                    </div>

                    <div class="hrForm_group">
                        <label class="hrForm_label" for="hr_password">Password <span class="required">*</span></label>
                        <input type="password" id="hr_password" name="hr_password" class="hrForm_input" required>
                    </div>

                    <div class="hrForm_group">
                        <label class="hrForm_label" for="hr_firstName">First Name <span class="required">*</span></label>
                        <input type="text" id="hr_firstName" name="hr_firstName" class="hrForm_input" value="<?php echo $_POST['hr_firstName'] ?? ''; ?>" required>
                    </div>

                    <div class="hrForm_group">
                        <label class="hrForm_label" for="hr_lastName">Last Name <span class="required">*</span></label>
                        <input type="text" id="hr_lastName" name="hr_lastName" class="hrForm_input" value="<?php echo $_POST['hr_lastName'] ?? ''; ?>" required>
                    </div>

                    <div class="hrForm_group">
                        <label class="hrForm_label" for="hr_dob">Date of Birth <span class="required">*</span></label>
                        <input type="date" id="hr_dob" name="hr_dob" class="hrForm_input" value="<?php echo $_POST['hr_dob'] ?? ''; ?>" required>
                    </div>

                    <div class="hrForm_group">
                        <label class="hrForm_label" for="hr_gender">Gender <span class="required">*</span></label>
                        <select id="hr_gender" name="hr_gender" class="hrForm_input" required>
                            <option value="">Select Gender</option>
                            <option value="Male" <?php echo (isset($_POST['hr_gender']) && $_POST['hr_gender'] === 'Male') ? 'selected' : ''; ?>>Male</option>
                            <option value="Female" <?php echo (isset($_POST['hr_gender']) && $_POST['hr_gender'] === 'Female') ? 'selected' : ''; ?>>Female</option>
                            <option value="Other" <?php echo (isset($_POST['hr_gender']) && $_POST['hr_gender'] === 'Other') ? 'selected' : ''; ?>>Other</option>
                        </select>
                    </div>

                    <div class="hrForm_group">
                        <label class="hrForm_label" for="hr_email">Email <span class="required">*</span></label>
                        <input type="email" id="hr_email" name="hr_email" class="hrForm_input" value="<?php echo $_POST['hr_email'] ?? ''; ?>" required>
                    </div>

                    <div class="hrForm_group">
                        <label class="hrForm_label" for="hr_phone">Phone <span class="required">*</span></label>
                        <input type="tel" id="hr_phone" name="hr_phone" class="hrForm_input" value="<?php echo $_POST['hr_phone'] ?? ''; ?>" required>
                    </div>

                    <div class="hrForm_group full">
                        <label class="hrForm_label" for="hr_address">Address <span class="required">*</span></label>
                        <input type="text" id="hr_address" name="hr_address" class="hrForm_input" value="<?php echo $_POST['hr_address'] ?? ''; ?>" required>
                    </div>

                    <div class="hrForm_group">
                        <label class="hrForm_label" for="hr_role">Role <span class="required">*</span></label>
                        <select id="hr_role" name="hr_role" class="hrForm_input" required>
                            <option value="">Select Role</option>
                            <option value="Software_Developer" <?php echo (isset($_POST['hr_role']) && $_POST['hr_role'] === 'Software_Developer') ? 'selected' : ''; ?>>Software Developer</option>
                            <option value="Software_Designer" <?php echo (isset($_POST['hr_role']) && $_POST['hr_role'] === 'Software_Designer') ? 'selected' : ''; ?>>Software Designer</option>
                            <option value="Software_Tester" <?php echo (isset($_POST['hr_role']) && $_POST['hr_role'] === 'Software_Tester') ? 'selected' : ''; ?>>Software Tester</option>
                            <option value="Salesman" <?php echo (isset($_POST['hr_role']) && $_POST['hr_role'] === 'Salesman') ? 'selected' : ''; ?>>Salesman</option>
                            <option value="Digital_Marketing_Specialist" <?php echo (isset($_POST['hr_role']) && $_POST['hr_role'] === 'Digital_Marketing_Specialist') ? 'selected' : ''; ?>>Digital Marketing Specialist</option>
                            <option value="Content_Marketing_Specialist" <?php echo (isset($_POST['hr_role']) && $_POST['hr_role'] === 'Content_Marketing_Specialist') ? 'selected' : ''; ?>>Content Marketing Specialist</option>
                            <option value="PR_Officer" <?php echo (isset($_POST['hr_role']) && $_POST['hr_role'] === 'PR_Officer') ? 'selected' : ''; ?>>PR Officer</option>
                            <option value="Driver" <?php echo (isset($_POST['hr_role']) && $_POST['hr_role'] === 'Driver') ? 'selected' : ''; ?>>Driver</option>
                            <option value="Cleaner" <?php echo (isset($_POST['hr_role']) && $_POST['hr_role'] === 'Cleaner') ? 'selected' : ''; ?>>Cleaner</option>
                            <option value="Watchman" <?php echo (isset($_POST['hr_role']) && $_POST['hr_role'] === 'Watchman') ? 'selected' : ''; ?>>Watchman</option>
                        </select>
                    </div>

                    <div class="hrForm_group">
                        <label class="hrForm_label" for="hr_dept">Department <span class="required">*</span></label>
                        <select id="hr_dept" name="hr_dept" class="hrForm_input" required>
                            <option value="">Select Department</option>
                            <option value="Software" <?php echo (isset($_POST['hr_dept']) && $_POST['hr_dept'] === 'Software') ? 'selected' : ''; ?>>Software</option>
                            <option value="Marketing" <?php echo (isset($_POST['hr_dept']) && $_POST['hr_dept'] === 'Marketing') ? 'selected' : ''; ?>>Marketing</option>
                            <option value="Facilities" <?php echo (isset($_POST['hr_dept']) && $_POST['hr_dept'] === 'Facilities') ? 'selected' : ''; ?>>Facilities</option>
                            <option value="HR" <?php echo (isset($_POST['hr_dept']) && $_POST['hr_dept'] === 'HR') ? 'selected' : ''; ?>>HR</option>
                        </select>
                    </div>

                    <div class="hrForm_group">
                        <label class="hrForm_label" for="hr_salary">Salary <span class="required">*</span></label>
                        <input type="number" step="0.01" id="hr_salary" name="hr_salary" class="hrForm_input" value="<?php echo $_POST['hr_salary'] ?? ''; ?>" required>
                    </div>

                    <div class="hrForm_group">
                        <label class="hrForm_label" for="hr_managerId">Manager</label>
                        <select id="hr_managerId" name="hr_managerId" class="hrForm_input">
                            <option value="">Select Manager (Optional)</option>
                            <?php foreach ($managers as $manager): ?>
                                <option value="<?php echo $manager['ManagerID']; ?>" <?php echo (isset($_POST['hr_managerId']) && $_POST['hr_managerId'] == $manager['ManagerID']) ? 'selected' : ''; ?>>
                                    <?php echo $manager['FirstName'] . ' ' . $manager['LastName'] . ' (' . $manager['UserName'] . ')'; ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="hrForm_group">
                        <label class="hrForm_label" for="hr_joinDate">Join Date</label>
                        <input type="date" id="hr_joinDate" name="hr_joinDate" class="hrForm_input" value="<?php echo $_POST['hr_joinDate'] ?? date('Y-m-d'); ?>">
                    </div>

                    <button type="submit" class="hrForm_submit">Recruit Employee</button>
                </div>
            </form>
        </div>
    </main>
</body>
</html>