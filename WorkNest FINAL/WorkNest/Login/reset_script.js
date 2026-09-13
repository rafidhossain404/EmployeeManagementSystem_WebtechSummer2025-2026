// =====================================================================
// RESET PASSWORD PAGE SCRIPT (simple / beginner version)
//
// This page only works if the user just came from the "forgot
// password" page and successfully verified their identity there.
// It lets them type a new password and saves it.
//
// NOTE: Uses the same demo account details as login_script.js and
// forgot_script.js (this used to be different data, which was a bug).
// =====================================================================

var USERS_KEY = "worknest_users";

var DEFAULT_USER = {
  userId: "MGR-001",
  name: "TASNIA ISLAM",
  title: "Engineering Manager",
  email: "tasnia.islam@worknest.com",
  phone: "+880 1785425256",
  password: "worknest123",
  role: "manager"
};

var DEFAULT_EMPLOYEE = {
  userId: "EMP-001",
  name: "MUNTASIRUL HOQUE",
  title: "Software Engineer",
  email: "muntasirul.hoque@worknest.com",
  phone: "+880 1791471601",
  password: "worknest123",
  role: "employee"
};

// Turns one user object into a single line of plain text.
// We put a "|" between each piece of info so we can split it apart later.
// Order: userId|name|title|email|phone|password|role
function userToText(user) {
  return user.userId + "|" + user.name + "|" + user.title + "|" +
         user.email + "|" + user.phone + "|" + user.password + "|" + user.role;
}

// Turns one line of plain text back into a user object.
function textToUser(line) {
  var parts = line.split("|");
  return {
    userId: parts[0],
    name: parts[1],
    title: parts[2],
    email: parts[3],
    phone: parts[4],
    password: parts[5],
    role: parts[6]
  };
}

// Makes sure both demo accounts exist inside localStorage.
function seedUsersIfEmpty() {
  var users = [];

  // Users are stored as plain text, one user per line.
  var saved = localStorage.getItem(USERS_KEY);
  if (saved) {
    var lines = saved.split("\n");
    for (var i = 0; i < lines.length; i++) {
      if (lines[i] !== "") {
        users.push(textToUser(lines[i]));
      }
    }
  }

  var managerExists = false;
  var employeeExists = false;

  for (var i = 0; i < users.length; i++) {
    if (users[i].userId.toLowerCase() === DEFAULT_USER.userId.toLowerCase()) {
      managerExists = true;
    }
    if (users[i].userId.toLowerCase() === DEFAULT_EMPLOYEE.userId.toLowerCase()) {
      employeeExists = true;
    }
  }

  if (!managerExists) {
    users.push(DEFAULT_USER);
  }
  if (!employeeExists) {
    users.push(DEFAULT_EMPLOYEE);
  }

  var lines = [];
  for (var j = 0; j < users.length; j++) {
    lines.push(userToText(users[j]));
  }
  localStorage.setItem(USERS_KEY, lines.join("\n"));
}

function getUsers() {
  seedUsersIfEmpty();

  var users = [];
  var saved = localStorage.getItem(USERS_KEY);
  var lines = saved.split("\n");

  for (var i = 0; i < lines.length; i++) {
    if (lines[i] !== "") {
      users.push(textToUser(lines[i]));
    }
  }

  return users;
}

function saveUsers(users) {
  var lines = [];
  for (var i = 0; i < users.length; i++) {
    lines.push(userToText(users[i]));
  }
  localStorage.setItem(USERS_KEY, lines.join("\n"));
}

seedUsersIfEmpty();

// ---------------------------------------------------------------------
// PAGE GUARD
// The forgot-password page saves the verified user's ID into
// sessionStorage. If that value is missing, someone opened this page
// directly without verifying first, so send them back.
// ---------------------------------------------------------------------
var verifiedUserId = sessionStorage.getItem("worknest_verified_user");
if (!verifiedUserId) {
  window.location.href = "forgot_index.html";
}

// Personalize the subtitle, e.g. "Choose a new password for MGR-001."
document.getElementById("subtext").textContent =
  "Choose a new password for " + verifiedUserId + ".";

// ---------------------------------------------------------------------
// Grab the elements we need from the page.
// ---------------------------------------------------------------------
var form = document.getElementById("resetForm");
var newPasswordInput = document.getElementById("newPassword");
var confirmPasswordInput = document.getElementById("confirmPassword");
var newPasswordError = document.getElementById("newPasswordError");
var confirmPasswordError = document.getElementById("confirmPasswordError");
var topMsg = document.getElementById("topMsg");

// ---------------------------------------------------------------------
// Show / hide password for both password fields.
// ---------------------------------------------------------------------
document.getElementById("eyeToggle1").addEventListener("click", function () {
  if (newPasswordInput.type === "password") {
    newPasswordInput.type = "text";
  } else {
    newPasswordInput.type = "password";
  }
});

document.getElementById("eyeToggle2").addEventListener("click", function () {
  if (confirmPasswordInput.type === "password") {
    confirmPasswordInput.type = "text";
  } else {
    confirmPasswordInput.type = "password";
  }
});

// Password rules: at least 8 characters, with at least one letter and one number.
var PASSWORD_MIN_LEN = 8;
var PASSWORD_STRENGTH_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/;

// ---------------------------------------------------------------------
// Helper functions for showing / clearing error messages.
// ---------------------------------------------------------------------
function clearErrors() {
  newPasswordInput.classList.remove("invalid");
  confirmPasswordInput.classList.remove("invalid");

  newPasswordError.textContent = "";
  newPasswordError.classList.remove("show");
  confirmPasswordError.textContent = "";
  confirmPasswordError.classList.remove("show");

  topMsg.style.display = "none";
}

function setFieldError(input, errorEl, message) {
  input.classList.add("invalid");
  errorEl.textContent = message;
  errorEl.classList.add("show");
}

// ---------------------------------------------------------------------
// Main logic: runs when the reset form is submitted.
// ---------------------------------------------------------------------
form.addEventListener("submit", function (e) {
  e.preventDefault();
  clearErrors();

  var newPassword = newPasswordInput.value;
  var confirmPassword = confirmPasswordInput.value;
  var hasError = false;

  // Step 1: Check the new password meets the rules.
  if (newPassword === "") {
    setFieldError(newPasswordInput, newPasswordError, "New password is required.");
    hasError = true;
  } else if (newPassword.length < PASSWORD_MIN_LEN) {
    setFieldError(newPasswordInput, newPasswordError, "Password must be at least " + PASSWORD_MIN_LEN + " characters.");
    hasError = true;
  } else if (!PASSWORD_STRENGTH_REGEX.test(newPassword)) {
    setFieldError(newPasswordInput, newPasswordError, "Password must include at least one letter and one number.");
    hasError = true;
  }

  // Step 2: Check the confirm field matches the new password.
  if (confirmPassword === "") {
    setFieldError(confirmPasswordInput, confirmPasswordError, "Please confirm your new password.");
    hasError = true;
  } else if (newPassword !== "" && confirmPassword !== newPassword) {
    setFieldError(confirmPasswordInput, confirmPasswordError, "Passwords do not match.");
    hasError = true;
  }

  if (hasError) {
    return;
  }

  // Step 3: Find this user in storage and update their password.
  var users = getUsers();
  var userIndex = -1;

  for (var i = 0; i < users.length; i++) {
    if (users[i].userId === verifiedUserId) {
      userIndex = i;
      break;
    }
  }

  if (userIndex === -1) {
    topMsg.textContent = "Something went wrong locating your account. Please start over.";
    topMsg.className = "msg error";
    topMsg.style.display = "block";
    return;
  }

  users[userIndex].password = newPassword;
  saveUsers(users);

  // Clear the "verified" flag so this page can't be reused without
  // verifying identity again.
  sessionStorage.removeItem("worknest_verified_user");

  // Step 4: Show success and send the user back to the login page.
  topMsg.textContent = "Your password has been reset successfully. Redirecting to sign in...";
  topMsg.className = "msg success";
  topMsg.style.display = "block";
  form.reset();

  setTimeout(function () {
    window.location.href = "login_index.html";
  }, 1500);
});
