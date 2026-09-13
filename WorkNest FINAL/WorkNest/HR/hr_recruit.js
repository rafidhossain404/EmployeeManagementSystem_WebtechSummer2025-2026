document.addEventListener("DOMContentLoaded", function () {
  const managerSelect = document.getElementById("hrManager_select");
  window.WORKNEST.managers.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m.ManagerID;
    opt.textContent = `${m.FirstName} ${m.LastName}`;
    managerSelect.appendChild(opt);
  });

  document.getElementById("hrJoin_date").value = new Date().toISOString().split("T")[0];

  document.getElementById("hrRecruit_form").addEventListener("submit", handleRecruitSubmit);
});

function showMessage(text, type) {
  const box = document.getElementById("hrForm_messageBox");
  box.innerHTML = `<div class="hrForm_message ${type}">${text}</div>`;
}

function handleRecruitSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());

  const required = ["hr_userName", "hr_password", "hr_firstName", "hr_lastName", "hr_dob", "hr_gender", "hr_email", "hr_phone", "hr_address", "hr_role", "hr_dept", "hr_salary"];
  for (const field of required) {
    if (!data[field]) {
      showMessage("All fields are required!", "error");
      return;
    }
  }

  const W = window.WORKNEST;
  if (W.employees.some((emp) => emp.UserName === data.hr_userName)) {
    showMessage("Username already exists!", "error");
    return;
  }
  if (W.employees.some((emp) => emp.Email === data.hr_email)) {
    showMessage("Email already exists!", "error");
    return;
  }

  const newId = Math.max(...W.employees.map((e) => e.EmployeeID), 100) + 1;
  W.employees.push({
    EmployeeID: newId,
    UserName: data.hr_userName,
    FirstName: data.hr_firstName,
    LastName: data.hr_lastName,
    Role: data.hr_role,
    Dept: data.hr_dept,
    Status: "Active",
    Email: data.hr_email,
    Phone: data.hr_phone,
    Address: data.hr_address,
    Salary: parseFloat(data.hr_salary),
    ManagerID: data.hr_managerId ? Number(data.hr_managerId) : null
  });

  showMessage("Employee recruited successfully!", "success");
  form.reset();
  document.getElementById("hrJoin_date").value = new Date().toISOString().split("T")[0];
}
