document.addEventListener("DOMContentLoaded", populateEmployeeSelect);

function activeEmployees() {
  return window.WORKNEST.employees.filter((e) => e.Status !== "Inactive");
}

function populateEmployeeSelect() {
  const select = document.getElementById("hrEmployee_select");
  const list = activeEmployees();

  select.innerHTML = `<option value="">Select an employee...</option>` +
    list.map((emp) => `<option value="${emp.EmployeeID}">${emp.FirstName} ${emp.LastName} (${emp.Role})</option>`).join("");

  document.getElementById("hrNoEmployees_msg").style.display = list.length === 0 ? "block" : "none";
}

function onEmployeeSelect() {
  const id = document.getElementById("hrEmployee_select").value;
  const details = document.getElementById("hrEmployee_details");

  if (!id) {
    details.innerHTML = `<p style="color: #8890a0;">Select an employee from the list to view details.</p>`;
    return;
  }

  const emp = window.WORKNEST.findEmployee(id);
  if (!emp) return;

  details.innerHTML = `
    <div class="hrTerminate_employeeInfo">
        <p><strong>Name:</strong> ${emp.FirstName} ${emp.LastName}</p>
        <p><strong>Email:</strong> ${emp.Email}</p>
        <p><strong>Role:</strong> ${emp.Role}</p>
        <p><strong>Status:</strong> <span class="hrStatus_badge hrStatus_active">${emp.Status}</span></p>
    </div>
    <button class="hrTerminate_confirmBtn" onclick="confirmTerminate(${emp.EmployeeID})">Terminate Employee</button>`;
}

function confirmTerminate(employeeId) {
  if (!confirm("Are you sure you want to terminate this employee? This action cannot be undone.")) return;

  const emp = window.WORKNEST.findEmployee(employeeId);
  if (!emp) return;

  emp.Status = "Inactive";

  document.getElementById("hrForm_messageBox").innerHTML =
    `<div class="hrForm_message success" style="margin-bottom: 20px;">Employee terminated successfully!</div>`;

  populateEmployeeSelect();
  document.getElementById("hrEmployee_details").innerHTML = `<p style="color: #8890a0;">Select an employee from the list to view details.</p>`;
}
