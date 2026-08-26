<?php
require_once 'hr_config.php';

?>
<?php
$conn = getDBConnection();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Employees - WorkNest</title>
    <link rel="stylesheet" href="hr_dashboard.css">
    <style>
        .hrPage_header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }
        
        .hrPage_search {
            display: flex;
            gap: 12px;
        }
        
        .hrPage_search input {
            padding: 10px 16px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            width: 300px;
        }
        
        .hrPage_search button {
            padding: 10px 20px;
            background: #667eea;
            color: #fff;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
        }
        
        .hrPage_table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }
        
        .hrPage_table th {
            text-align: left;
            padding: 14px 12px;
            background: #f8fafc;
            color: #475569;
            font-weight: 600;
            border-bottom: 2px solid #e2e8f0;
        }
        
        .hrPage_table td {
            padding: 12px;
            border-bottom: 1px solid #f1f5f9;
        }
        
        .hrPage_table tr:hover td {
            background: #f8fafc;
        }
        
        .hrPage_status_active {
            color: #059669;
            background: #d1fae5;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .hrPage_status_inactive {
            color: #dc2626;
            background: #fecaca;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .hrPage_status_leave {
            color: #d97706;
            background: #fef3c7;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
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
                <h1 class="hrHeader_title">Manage Employees</h1>
                <p class="hrHeader_subtitle">View and manage all employees</p>
            </div>
            <div class="hrHeader_profile">
                <span class="hrHeader_profileName">HI</span>
            </div>
        </header>

        <div class="hrPage_header">
            <div class="hrPage_search">
                <input type="text" id="hrSearch_input" placeholder="Search by name, email, or role..." onkeyup="searchEmployees()">
                <button onclick="searchEmployees()">Search</button>
            </div>
            <a href="hr_recruit.php" class="hrAction_btn hrAction_btn_approve" style="padding: 10px 20px; text-decoration: none;">+ Add New Employee</a>
        </div>

        <div style="background: #fff; border-radius: 16px; padding: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
            <table class="hrPage_table" id="hrEmployee_table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="hrEmployee_body">
                    <?php
                    $sql = "SELECT u.UserName, u.FirstName, u.LastName, u.Email, u.Dept, u.Role, u.Status, e.EmployeeID
                            FROM User u 
                            JOIN Employee e ON u.UserName = e.UserName 
                            WHERE u.Role NOT IN ('HR', 'Manager')
                            ORDER BY u.JoinDate DESC";
                    $result = mysqli_query($conn, $sql);
                    
                    if (mysqli_num_rows($result) > 0) {
                        while ($row = mysqli_fetch_assoc($result)) {
                            $statusClass = $row['Status'] === 'Active' ? 'hrPage_status_active' : 
                                          ($row['Status'] === 'On_leave' ? 'hrPage_status_leave' : 'hrPage_status_inactive');
                            echo "<tr>
                                <td>{$row['EmployeeID']}</td>
                                <td>{$row['FirstName']} {$row['LastName']}</td>
                                <td>{$row['Email']}</td>
                                <td>{$row['Dept']}</td>
                                <td>{$row['Role']}</td>
                                <td><span class='{$statusClass}'>{$row['Status']}</span></td>
                                <td>
                                    <a href='hr_update_employee.php?id={$row['EmployeeID']}' class='hrAction_btn hrAction_btn_processing' style='text-decoration: none;'>Edit</a>
                                    <a href='hr_terminate.php?id={$row['EmployeeID']}' class='hrAction_btn hrAction_btn_reject' style='text-decoration: none;'>Terminate</a>
                                </td>
                            </tr>";
                        }
                    } else {
                        echo "<tr><td colspan='7' class='hrRecent_empty'>No employees found</td></tr>";
                    }
                    ?>
                </tbody>
            </table>
        </div>
    </main>

    <script>
        function searchEmployees() {
            const searchTerm = document.getElementById('hrSearch_input').value.toLowerCase();
            const rows = document.querySelectorAll('#hrEmployee_body tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }
    </script>
</body>
</html>