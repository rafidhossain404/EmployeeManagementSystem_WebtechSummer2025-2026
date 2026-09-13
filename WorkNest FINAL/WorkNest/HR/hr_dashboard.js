document.addEventListener("DOMContentLoaded", function () {
  loadDashboardData();
  loadEmployeeOverview();
});

function loadDashboardData() {
  const W = window.WORKNEST;
  const totalEmployees = W.employees.length;
  const activeEmployees = W.employees.filter((e) => e.Status === "Active").length;
  const pendingLeaves = W.leaves.filter((l) => l.Status === "Processing").length;
  const pendingPromotions = W.promotions.filter((p) => p.Status === "Processing").length;

  document.getElementById("hrStats_totalEmployees").textContent = totalEmployees;
  document.getElementById("hrStats_pendingLeaves").textContent = pendingLeaves;
  document.getElementById("hrStats_pendingPromotions").textContent = pendingPromotions;
  document.getElementById("hrStats_activeEmployees").textContent = activeEmployees;
  document.getElementById("hrName_display").textContent = `${W.hrUser.firstName} ${W.hrUser.lastName}`;
  document.getElementById("hrName_full").textContent = `${W.hrUser.firstName} ${W.hrUser.lastName}`;

  // Build initials (e.g. "Ayesha Rahman" -> "AR") instead of leaving
  // the avatar stuck on a hardcoded "HR".
  const initials = (W.hrUser.firstName[0] + W.hrUser.lastName[0]).toUpperCase();
  document.getElementById("hrName_short").textContent = initials;
}

function loadEmployeeOverview() {
  const W = window.WORKNEST;
  const tbody = document.getElementById("hrRecent_employeeBody");
  const employees = W.employees;

  if (employees && employees.length > 0) {
    tbody.innerHTML = employees.map((emp) => `
        <tr>
            <td><strong>${emp.FirstName || "N/A"}</strong></td>
            <td>${emp.Dept || "N/A"}</td>
            <td>${emp.Role || "N/A"}</td>
            <td><span class="hrStatus_badge hrStatus_${(emp.Status || "unknown").toLowerCase()}">${emp.Status || "Unknown"}</span></td>
        </tr>
    `).join("");
  } else {
    tbody.innerHTML = `<tr><td colspan="4" class="hrEmptyState">No employees found</td></tr>`;
  }
}
