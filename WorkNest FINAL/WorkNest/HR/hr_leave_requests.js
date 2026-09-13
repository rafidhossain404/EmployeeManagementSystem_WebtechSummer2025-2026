document.addEventListener("DOMContentLoaded", renderLeaves);

function renderLeaves() {
  const tbody = document.getElementById("hrLeave_body");
  const leaves = window.WORKNEST.leaves.filter((l) => l.Status === "Processing");

  if (leaves.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="hrEmptyState">No processing leave requests</td></tr>`;
    return;
  }

  tbody.innerHTML = leaves.map((leave) => {
    const statusClass = leave.Status.toLowerCase();
    return `<tr>
        <td>${leave.LeaveID}</td>
        <td>${leave.FirstName} ${leave.LastName}</td>
        <td>${leave.Dept}</td>
        <td>${leave.SD}</td>
        <td>${leave.ED}</td>
        <td>${leave.Reason.substring(0, 50)}...</td>
        <td><span class="hrStatus_badge hrStatus_${statusClass}">${leave.Status}</span></td>
        <td>
            <button class="hrAction_btn hrAction_btn_approve" onclick="handleLeaveAction(${leave.LeaveID}, 'Accepted')">Accept</button>
            <button class="hrAction_btn hrAction_btn_reject" onclick="handleLeaveAction(${leave.LeaveID}, 'Rejected')">Reject</button>
        </td>
    </tr>`;
  }).join("");
}

function handleLeaveAction(leaveId, action) {
  if (!confirm(`Are you sure you want to ${action} this leave request?`)) return;

  const leave = window.WORKNEST.leaves.find((l) => l.LeaveID === leaveId);
  if (!leave) {
    alert("Leave request not found.");
    return;
  }

  leave.Status = action;

  if (action === "Accepted") {
    const emp = window.WORKNEST.employees.find((e) => e.UserName === leave.UserName);
    if (emp) emp.Status = "On_leave";
  }

  renderLeaves();
}

function filterLeaves() {
  const status = document.getElementById("hrFilter_status").value;
  const search = document.getElementById("hrSearch_input").value.toLowerCase();
  const rows = document.querySelectorAll("#hrLeave_body tr");

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    const statusCell = row.querySelector(".hrStatus_badge");
    const statusText = statusCell ? statusCell.textContent.toLowerCase() : "";
    const statusMatch = status === "all" || statusText === status.toLowerCase();
    const searchMatch = text.includes(search);
    row.style.display = statusMatch && searchMatch ? "" : "none";
  });
}
