// =====================================================================
// LOGIN PAGE SCRIPT (simple / beginner version)
//
// What this file does:
// 1) Makes sure 2 demo accounts exist in localStorage (so we have
//    something to log in with, since there is no real server).
// 2) Checks the sign-in form when the user clicks "Sign in".
// =====================================================================

// The "key" (name) we use to save the list of users in localStorage.
var USERS_KEY = "worknest_users";

// Demo manager account.
var DEFAULT_USER = {
  userId: "MGR-001",
  name: "TASNIA ISLAM",
  title: "Engineering Manager",
  email: "tasnia.islam@worknest.com",
  phone: "+880 1785425256",
  password: "worknest123",
  role: "manager"
};

// Demo employee account.
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
// If the list is empty (or missing), we create it.
function seedUsersIfEmpty() {
  var users = [];

  // Try to read whatever is already saved. Users are stored as plain
  // text, one user per line (lines are separated by "\n").
  var saved = localStorage.getItem(USERS_KEY);
  if (saved) {
    var lines = saved.split("\n");
    for (var i = 0; i < lines.length; i++) {
      if (lines[i] !== "") {
        users.push(textToUser(lines[i]));
      }
    }
  }

  // Check (with a simple loop) if each demo account already exists.
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

  // Add whichever one is missing.
  if (!managerExists) {
    users.push(DEFAULT_USER);
  }
  if (!employeeExists) {
    users.push(DEFAULT_EMPLOYEE);
  }

  // Turn every user back into a line of text, then join them all
  // together with "\n" (a line break) and save that as one big string.
  var lines = [];
  for (var j = 0; j < users.length; j++) {
    lines.push(userToText(users[j]));
  }
  localStorage.setItem(USERS_KEY, lines.join("\n"));
}

// Returns the full list of saved users (as an array of user objects).
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

// ---------------------------------------------------------------------
// Grab the elements we need from the page.
// ---------------------------------------------------------------------
var form = document.getElementById("loginForm");
var userIdInput = document.getElementById("userId");
var passwordInput = document.getElementById("password");
var userIdError = document.getElementById("userIdError");
var passwordError = document.getElementById("passwordError");
var topMsg = document.getElementById("topMsg");
var eyeToggle = document.getElementById("eyeToggle");

// ---------------------------------------------------------------------
// Show / hide the password when the eye icon is clicked.
// ---------------------------------------------------------------------
eyeToggle.addEventListener("click", function () {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
});

// ---------------------------------------------------------------------
// Helper functions for showing / clearing error messages.
// ---------------------------------------------------------------------
function clearErrors() {
  userIdInput.classList.remove("invalid");
  passwordInput.classList.remove("invalid");

  userIdError.textContent = "";
  userIdError.classList.remove("show");

  passwordError.textContent = "";
  passwordError.classList.remove("show");

  topMsg.style.display = "none";
}

function setFieldError(input, errorEl, message) {
  input.classList.add("invalid");
  errorEl.textContent = message;
  errorEl.classList.add("show");
}

// ---------------------------------------------------------------------
// Main logic: runs when the sign-in form is submitted.
// ---------------------------------------------------------------------
form.addEventListener("submit", function (e) {
  e.preventDefault(); // stop the page from reloading
  clearErrors();

  var userId = userIdInput.value.trim();
  var password = passwordInput.value;
  var hasError = false;

  // Step 1: Check that both fields were filled in.
  if (userId === "") {
    setFieldError(userIdInput, userIdError, "User ID is required.");
    hasError = true;
  }
  if (password === "") {
    setFieldError(passwordInput, passwordError, "Password is required.");
    hasError = true;
  }
  if (hasError) {
    return; // stop here, something is missing
  }

  // Step 2: Look for an account with a matching User ID.
  var users = getUsers();
  var matchedUser = null;

  for (var i = 0; i < users.length; i++) {
    if (users[i].userId.toLowerCase() === userId.toLowerCase()) {
      matchedUser = users[i];
      break;
    }
  }

  if (matchedUser === null) {
    setFieldError(userIdInput, userIdError, "No account found with that User ID.");
    return;
  }

  // Step 3: Check the password.
  if (matchedUser.password !== password) {
    setFieldError(passwordInput, passwordError, "Incorrect password.");
    return;
  }

  // Step 4: Everything matched! Show success and go to the dashboard.
  topMsg.textContent = "Signed in successfully. Welcome back, " + matchedUser.name + "!";
  topMsg.className = "msg success";
  topMsg.style.display = "block";
  form.reset();

  // Remember who is logged in for this browser session.
  sessionStorage.setItem("worknest_current_user", userToText(matchedUser));

  // Wait a moment, then send the user to the right dashboard.
  setTimeout(function () {
    if (matchedUser.role === "manager") {
      window.location.href = "../MANAGER/manager_index.html";
    } else {
      window.location.href = "../EMPLOYEE/index.html";
    }
  }, 800);
});

// Make sure the demo accounts exist as soon as the page loads.
seedUsersIfEmpty();
