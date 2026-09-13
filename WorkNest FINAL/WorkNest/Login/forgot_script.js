// =====================================================================
// FORGOT PASSWORD PAGE SCRIPT (simple / beginner version)
//
// This page asks for 4 details (User ID, name, email, phone).
// If all 4 match a saved account, we remember which account was
// verified and send the user to the reset-password page.
//
// NOTE: This uses the EXACT same demo account details as
// login_script.js, so that the demo accounts you sign in with are
// the same ones you can "verify" here. (Before, this file had
// different fake names/emails/phones than the login page, so the
// forgot-password check would never match — that bug is fixed now.)
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

// Removes spaces, dashes, and parentheses so phone numbers can be
// compared even if typed with different formatting.
// e.g. "+880 178-542-5256" becomes "+8801785425256"
function normalizePhone(value) {
  return value.replace(/[\s\-()]/g, "");
}

// ---------------------------------------------------------------------
// Grab the elements we need from the page.
// ---------------------------------------------------------------------
var form = document.getElementById("forgotForm");
var userIdInput = document.getElementById("userId");
var nameInput = document.getElementById("fullName");
var emailInput = document.getElementById("email");
var phoneInput = document.getElementById("phone");

var userIdError = document.getElementById("userIdError");
var nameError = document.getElementById("fullNameError");
var emailError = document.getElementById("emailError");
var phoneError = document.getElementById("phoneError");
var topMsg = document.getElementById("topMsg");

// Simple pattern checks:
// - email must look like "something@something.something"
// - phone must be 7-15 digits, optionally starting with "+"
var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var PHONE_REGEX = /^\+?[0-9]{7,15}$/;

// ---------------------------------------------------------------------
// Helper functions for showing / clearing error messages.
// ---------------------------------------------------------------------
function clearErrors() {
  userIdInput.classList.remove("invalid");
  nameInput.classList.remove("invalid");
  emailInput.classList.remove("invalid");
  phoneInput.classList.remove("invalid");

  userIdError.textContent = "";
  userIdError.classList.remove("show");
  nameError.textContent = "";
  nameError.classList.remove("show");
  emailError.textContent = "";
  emailError.classList.remove("show");
  phoneError.textContent = "";
  phoneError.classList.remove("show");

  topMsg.style.display = "none";
}

function setFieldError(input, errorEl, message) {
  input.classList.add("invalid");
  errorEl.textContent = message;
  errorEl.classList.add("show");
}

// ---------------------------------------------------------------------
// Main logic: runs when the form is submitted.
// ---------------------------------------------------------------------
form.addEventListener("submit", function (e) {
  e.preventDefault();
  clearErrors();

  var userId = userIdInput.value.trim();
  var name = nameInput.value.trim();
  var email = emailInput.value.trim();
  var phone = phoneInput.value.trim();
  var hasError = false;

  // Step 1: Check every field has a value, and email/phone look valid.
  if (userId === "") {
    setFieldError(userIdInput, userIdError, "User ID is required.");
    hasError = true;
  }
  if (name === "") {
    setFieldError(nameInput, nameError, "Full name is required.");
    hasError = true;
  }
  if (email === "") {
    setFieldError(emailInput, emailError, "Email is required.");
    hasError = true;
  } else if (!EMAIL_REGEX.test(email)) {
    setFieldError(emailInput, emailError, "Enter a valid email address.");
    hasError = true;
  }
  if (phone === "") {
    setFieldError(phoneInput, phoneError, "Phone number is required.");
    hasError = true;
  } else if (!PHONE_REGEX.test(normalizePhone(phone))) {
    setFieldError(phoneInput, phoneError, "Enter a valid phone number.");
    hasError = true;
  }
  if (hasError) {
    return;
  }

  // Step 2: Look through every saved user to see if ALL 4 details match.
  var users = getUsers();
  var matchedUser = null;

  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    var sameUserId = u.userId.toLowerCase() === userId.toLowerCase();
    var sameName = u.name.toLowerCase() === name.toLowerCase();
    var sameEmail = u.email.toLowerCase() === email.toLowerCase();
    var samePhone = normalizePhone(u.phone) === normalizePhone(phone);

    if (sameUserId && sameName && sameEmail && samePhone) {
      matchedUser = u;
      break;
    }
  }

  if (matchedUser === null) {
    topMsg.textContent = "The details you entered do not match any WorkNest account. Please check and try again.";
    topMsg.className = "msg error";
    topMsg.style.display = "block";
    return;
  }

  // Step 3: Identity confirmed. Remember which user was verified,
  // then move on to the reset-password page.
  sessionStorage.setItem("worknest_verified_user", matchedUser.userId);
  window.location.href = "reset_index.html";
});

seedUsersIfEmpty();
