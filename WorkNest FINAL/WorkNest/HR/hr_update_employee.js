document.addEventListener("DOMContentLoaded", populateEmployeeSelect);

function editableEmployees() {
  return window.WORKNEST.employees.filter((e) => !e.Role.includes("Manager"));
}

function populateEmployeeSelect() {
  const select = document.getElementById("hrEmployee_select");
  const list = editableEmployees();

  if (list.length === 0) {
    select.style.display = "none";
    document.getElementById("hrUpdate_formArea").innerHTML = `
      <div class="hrUpdate_notFound">
        <p style="font-size: 48px; margin-bottom: 16px;"></p>
        <p style="font-size: 18px;">No employees found</p>
        <p style="font-size: 14px; margin-top: 8px;">Please recruit an employee first.</p>
        <p style="margin-top: 16px;"><a href="hr_recruit.html" style="color: #2f5fed; text-decoration: none;">Recruit Employee</a></p>
      </div>`;
    return;
  }

  select.innerHTML = `<option value="">-- Select an employee --</option>` +
    list.map((emp) => `<option value="${emp.EmployeeID}">${emp.FirstName} ${emp.LastName} (${emp.Role}) - ${emp.Status}</option>`).join("");
}

function onEmployeeSelect() {
  const id = document.getElementById("hrEmployee_select").value;
  const formArea = document.getElementById("hrUpdate_formArea");

  if (!id) {
    formArea.innerHTML = "";
    return;
  }

  const emp = window.WORKNEST.findEmployee(id);
  if (!emp) return;

  const managerOptions = window.WORKNEST.managers
    .map((m) => `<option value="${m.ManagerID}" ${emp.ManagerID == m.ManagerID ? "selected" : ""}>${m.FirstName} ${m.LastName}</option>`)
    .join("");

  formArea.innerHTML = `
    <div class="hrUpdate_infoBox">
        <p><strong>Employee ID:</strong> ${emp.EmployeeID}</p>
        <p><strong>Username:</strong> ${emp.UserName}</p>
        <p><strong>Current Role:</strong> ${emp.Role}</p>
    </div>

    <form id="hrUpdate_form">
        <div class="hrUpdate_form">
            <div class="full">
                <label class="hrUpdate_label">Username (Cannot be changed)</label>
                <input type="text" class="hrUpdate_input" value="${emp.UserName}" disabled>
            </div>
            <div>
                <label class="hrUpdate_label">First Name</label>
                <input type="text" name="hr_firstName" class="hrUpdate_input" value="${emp.FirstName}" required>
            </div>
            <div>
                <label class="hrUpdate_label">Last Name</label>
                <input type="text" name="hr_lastName" class="hrUpdate_input" value="${emp.LastName}" required>
            </div>
            <div>
                <label class="hrUpdate_label">Email</label>
                <input type="email" name="hr_email" class="hrUpdate_input" value="${emp.Email}" required>
            </div>
            <div>
                <label class="hrUpdate_label">Phone</label>
                <input type="tel" name="hr_phone" class="hrUpdate_input" value="${emp.Phone}" required>
            </div>
            <div class="full">
                <label class="hrUpdate_label">Address</label>
                <input type="text" name="hr_address" class="hrUpdate_input" value="${emp.Address}" required>
            </div>
            <div>
                <label class="hrUpdate_label">Department</label>
                <select name="hr_dept" class="hrUpdate_input" required>
                    ${["Software", "Marketing", "Facilities", "HR"].map((d) => `<option value="${d}" ${emp.Dept === d ? "selected" : ""}>${d}</option>`).join("")}
                </select>
            </div>
            <div>
                <label class="hrUpdate_label">Salary</label>
                <input type="number" step="0.01" name="hr_salary" class="hrUpdate_input" value="${emp.Salary}" required>
            </div>
            <div>
                <label class="hrUpdate_label">Status</label>
                <select name="hr_status" class="hrUpdate_input" required>
                    <option value="Active" ${emp.Status === "Active" ? "selected" : ""}>Active</option>
                    <option value="Inactive" ${emp.Status === "Inactive" ? "selected" : ""}>Inactive</option>
                    <option value="On_leave" ${emp.Status === "On_leave" ? "selected" : ""}>On Leave</option>
                </select>
            </div>
            <div>
                <label class="hrUpdate_label">Manager</label>
                <select name="hr_managerId" class="hrUpdate_input">
                    <option value="">No Manager</option>
                    ${managerOptions}
                </select>
            </div>
            <button type="submit" class="hrUpdate_submit">Update Employee</button>
        </div>
    </form>

    <div style="margin-top: 16px; text-align: center;">
        <a href="#" onclick="resetForm(); return false;" style="color: #2f5fed; text-decoration: none;">Select another employee</a>
    </div>`;

  document.getElementById("hrUpdate_form").addEventListener("submit", (e) => handleUpdateSubmit(e, emp.EmployeeID));
}

function handleUpdateSubmit(e, employeeId) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const emp = window.WORKNEST.findEmployee(employeeId);
  if (!emp) return;

  Object.assign(emp, {
    FirstName: data.hr_firstName,
    LastName: data.hr_lastName,
    Email: data.hr_email,
    Phone: data.hr_phone,
    Address: data.hr_address,
    Dept: data.hr_dept,
    Salary: parseFloat(data.hr_salary),
    Status: data.hr_status,
    ManagerID: data.hr_managerId ? Number(data.hr_managerId) : null
  });

  document.getElementById("hrForm_messageBox").innerHTML =
    `<div class="hrForm_message success">Employee updated successfully!</div>`;

  populateEmployeeSelect();
  document.getElementById("hrEmployee_select").value = employeeId;
  onEmployeeSelect();
}

function resetForm() {
  document.getElementById("hrEmployee_select").value = "";
  document.getElementById("hrUpdate_formArea").innerHTML = "";
  document.getElementById("hrForm_messageBox").innerHTML = "";
}
