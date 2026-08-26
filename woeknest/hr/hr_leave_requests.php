<?php
require_once 'hr_config.php';
$conn = getDBConnection();
// Handle AJAX requests
if (isset($_GET['action']) && $_GET['action'] === 'get_pending') {
    header('Content-Type: application/json');
    
    $leaves = getPendingLeaveRequests($conn);
    echo json_encode([
        'success' => true,
        'leaves' => $leaves
    ]);
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leave Requests - WorkNest</title>
    <link rel="stylesheet" href="hr_dashboard.css">
    <style>
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
        
        .hrPage_filter {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
        }
        
        .hrPage_filter select {
            padding: 10px 16px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
        }
        
        .hrPage_filter input {
            padding: 10px 16px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            flex: 1;
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
                <h1 class="hrHeader_title">Leave Requests</h1>
                <p class="hrHeader_subtitle">Manage all leave requests</p>
            </div>
        </header>

        <div class="hrPage_filter">
            <select id="hrFilter_status" onchange="filterLeaves()">
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
            </select>
            <input type="text" id="hrSearch_input" placeholder="Search by name..." onkeyup="filterLeaves()">
        </div>

        <div style="background: #fff; border-radius: 16px; padding: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
            <table class="hrPage_table" id="hrLeave_table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="hrLeave_body">
                    <?php
                    $leaves = getPendingLeaveRequests($conn);
                    if (count($leaves) > 0) {
                        foreach ($leaves as $leave) {
                            $statusClass = strtolower($leave['Status']);
                            echo "<tr>
                                <td>{$leave['LeaveID']}</td>
                                <td>{$leave['FirstName']} {$leave['LastName']}</td>
                                <td>{$leave['Dept']}</td>
                                <td>{$leave['SD']}</td>
                                <td>{$leave['ED']}</td>
                                <td>" . substr($leave['Reason'], 0, 50) . "...</td>
                                <td><span class='hrStatus_badge hrStatus_{$statusClass}'>{$leave['Status']}</span></td>
                                <td>
                                    <button class='hrAction_btn hrAction_btn_approve' onclick='handleLeaveAction({$leave['LeaveID']}, \"Accepted\")'>Approve</button>
                                    <button class='hrAction_btn hrAction_btn_reject' onclick='handleLeaveAction({$leave['LeaveID']}, \"Rejected\")'>Reject</button>
                                </td>
                            </tr>";
                        }
                    } else {
                        echo "<tr><td colspan='8' class='hrRecent_empty'>No leave requests found</td></tr>";
                    }
                    ?>
                </tbody>
            </table>
        </div>
    </main>

    <script>
        function handleLeaveAction(leaveId, action) {
            if (!confirm(`Are you sure you want to ${action} this leave request?`)) return;
            
            const formData = new FormData();
            formData.append('leave_id', leaveId);
            formData.append('action', action);

            fetch('hr_leave_actions.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    alert(data.message || 'Error processing request');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred');
            });
        }

        function filterLeaves() {
            const status = document.getElementById('hrFilter_status').value;
            const search = document.getElementById('hrSearch_input').value.toLowerCase();
            const rows = document.querySelectorAll('#hrLeave_body tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                const statusCell = row.querySelector('.hrStatus_badge');
                const statusText = statusCell ? statusCell.textContent.toLowerCase() : '';
                
                const statusMatch = status === 'all' || statusText === status.toLowerCase();
                const searchMatch = text.includes(search);
                
                row.style.display = (statusMatch && searchMatch) ? '' : 'none';
            });
        }
    </script>
</body>
</html>