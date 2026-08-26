// HR Dashboard JavaScript

document.addEventListener("DOMContentLoaded", function () {
  // Load dashboard data
  loadDashboardData();
  loadEmployeeOverview();

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

function loadEmployeeOverview() {
  fetch("hr_dashboard_data.php?action=get_employees")
    .then((response) => response.json())
    .then((data) => {
      const tbody = document.getElementById("hrRecent_employeeBody");
      
      // Check if data is valid
      if (!data.success) {
        tbody.innerHTML = `<tr><td colspan="4" class="hrRecent_empty">Error: ${data.error || 'Unknown error'}</td></tr>`;
        return;
      }
      
      if (data.employees && data.employees.length > 0) {
        // Map columns: FirstName, Dept, Role, Status
        tbody.innerHTML = data.employees
          .map(
            (emp) => `
                    <tr>
                        <td><strong>${emp.FirstName || 'N/A'}</strong></td>
                        <td>${emp.Dept || 'N/A'}</td>
                        <td>${emp.Role || 'N/A'}</td>
                        <td><span class="hrStatus_badge hrStatus_${(emp.Status || 'unknown').toLowerCase()}">${emp.Status || 'Unknown'}</span></td>
                    </tr>
                `,
          )
          .join("");
      } else {
        tbody.innerHTML = `<tr><td colspan="4" class="hrRecent_empty">No employees found (excluding HR)</td></tr>`;
      }
    })
    .catch((error) => {
      console.error("Error loading employee overview:", error);
      const tbody = document.getElementById("hrRecent_employeeBody");
      tbody.innerHTML = `<tr><td colspan="4" class="hrRecent_empty">Error loading data: ${error.message}</td></tr>`;
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