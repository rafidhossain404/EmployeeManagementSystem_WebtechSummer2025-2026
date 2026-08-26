// HR Dashboard JavaScript

document.addEventListener("DOMContentLoaded", function () {
  // Load dashboard data
  loadDashboardData();
  loadRecentLeaves();
  loadRecentPromotions();

  // Set interval to refresh data every 60 seconds
  setInterval(loadDashboardData, 60000);
});

function loadDashboardData() {
  fetch("hr_dashboard_data.php")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        document.getElementById("hrStats_totalEmployees").textContent =
          data.total_employees;
        document.getElementById("hrStats_pendingLeaves").textContent =
          data.pending_leaves;
        document.getElementById("hrStats_pendingPromotions").textContent =
          data.pending_promotions;
        document.getElementById("hrStats_activeEmployees").textContent =
          data.active_employees;
        document.getElementById("hrName_display").textContent = data.hr_name;
      }
    })
    .catch((error) => console.error("Error loading dashboard data:", error));
}

function loadRecentLeaves() {
  fetch("hr_leave_requests.php?action=get_pending")
    .then((response) => response.json())
    .then((data) => {
      const tbody = document.getElementById("hrRecent_leaveBody");
      if (data.success && data.leaves.length > 0) {
        tbody.innerHTML = data.leaves
          .map(
            (leave) => `
                    <tr>
                        <td>${leave.FirstName} ${leave.LastName}</td>
                        <td>${leave.Dept || "N/A"}</td>
                        <td>${formatDate(leave.SD)}</td>
                        <td>${formatDate(leave.ED)}</td>
                        <td><span class="hrStatus_badge hrStatus_${leave.Status.toLowerCase()}">${leave.Status}</span></td>
                        <td>
                            <button class="hrAction_btn hrAction_btn_approve" onclick="handleLeaveAction('${leave.LeaveID}', 'Accepted')">Approve</button>
                            <button class="hrAction_btn hrAction_btn_reject" onclick="handleLeaveAction('${leave.LeaveID}', 'Rejected')">Reject</button>
                            <button class="hrAction_btn hrAction_btn_processing" onclick="handleLeaveAction('${leave.LeaveID}', 'Processing')">Processing</button>
                        </td>
                    </tr>
                `,
          )
          .join("");
      } else {
        tbody.innerHTML = `<tr><td colspan="6" class="hrRecent_empty">No pending leave requests</td></tr>`;
      }
    })
    .catch((error) => console.error("Error loading leave requests:", error));
}

function loadRecentPromotions() {
  fetch("hr_promote.php?action=get_pending")
    .then((response) => response.json())
    .then((data) => {
      const tbody = document.getElementById("hrRecent_promotionBody");
      if (data.success && data.promotions.length > 0) {
        tbody.innerHTML = data.promotions
          .map(
            (promo) => `
                    <tr>
                        <td>${promo.FirstName} ${promo.LastName}</td>
                        <td>${promo.Dept || "N/A"}</td>
                        <td>${promo.Role || "N/A"}</td>
                        <td>${formatDate(promo.PromotionDate)}</td>
                        <td><span class="hrStatus_badge hrStatus_${promo.Status.toLowerCase()}">${promo.Status}</span></td>
                        <td>
                            <button class="hrAction_btn hrAction_btn_approve" onclick="handlePromotionAction('${promo.PromotionID}', 'Approved')">Approve</button>
                            <button class="hrAction_btn hrAction_btn_reject" onclick="handlePromotionAction('${promo.PromotionID}', 'Rejected')">Reject</button>
                        </td>
                    </tr>
                `,
          )
          .join("");
      } else {
        tbody.innerHTML = `<tr><td colspan="6" class="hrRecent_empty">No pending promotion requests</td></tr>`;
      }
    })
    .catch((error) =>
      console.error("Error loading promotion requests:", error),
    );
}

function handleLeaveAction(leaveId, action) {
  if (!confirm(`Are you sure you want to ${action} this leave request?`))
    return;

  const formData = new FormData();
  formData.append("leave_id", leaveId);
  formData.append("action", action);

  fetch("hr_leave_actions.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        loadRecentLeaves();
        loadDashboardData();
        showNotification(`Leave request ${action} successfully!`, "success");
      } else {
        showNotification(data.message || "Error processing request", "error");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showNotification("An error occurred", "error");
    });
}

function handlePromotionAction(promotionId, action) {
  if (!confirm(`Are you sure you want to ${action} this promotion request?`))
    return;

  const formData = new FormData();
  formData.append("promotion_id", promotionId);
  formData.append("action", action);

  fetch("hr_promote.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        loadRecentPromotions();
        loadDashboardData();
        showNotification(
          `Promotion request ${action} successfully!`,
          "success",
        );
      } else {
        showNotification(data.message || "Error processing request", "error");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showNotification("An error occurred", "error");
    });
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `hrNotification hrNotification_${type}`;
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 8px;
        color: #fff;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        background: ${type === "success" ? "#059669" : "#dc2626"};
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transition = "opacity 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add animation styles
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);
