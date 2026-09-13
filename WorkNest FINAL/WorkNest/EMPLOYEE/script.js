// ===================== SESSION GUARD =====================
// If nobody is signed in, OR the person who is signed in is a
// manager (not an employee), send them back to the login page
// instead of showing this dashboard.
// The logged-in user is stored as one line of plain text, with a "|"
// between each piece of info: userId|name|title|email|phone|password|role
var currentUserRaw = sessionStorage.getItem("worknest_current_user");
var currentUser = null;

if (currentUserRaw) {
  var parts = currentUserRaw.split("|");
  currentUser = {
    userId: parts[0],
    name: parts[1],
    title: parts[2],
    email: parts[3],
    phone: parts[4],
    password: parts[5],
    role: parts[6]
  };
}

if (!currentUser || currentUser.role !== "employee") {
  window.location.href = "../Login/login_index.html";
}

// Turns a full name like "MUNTASIRUL HOQUE" into initials like "MH".
function getInitialsFromName(fullName) {
  var words = fullName.split(" ");
  var initials = "";
  for (var w = 0; w < words.length && initials.length < 2; w++) {
    if (words[w].length > 0) {
      initials += words[w][0].toUpperCase();
    }
  }
  return initials;
}

// Personalize EVERY place the user's name/title/initials show up,
// using whoever actually signed in (not the hardcoded HTML defaults).
if (currentUser) {
  var displayName = currentUser.name;
  var displayTitle = currentUser.title || "Employee";
  var displayInitials = getInitialsFromName(displayName);

  var topNameEl = document.getElementById("topName");
  var topRoleEl = document.getElementById("topRole");
  var topAvatarEl = document.getElementById("topAvatar");
  var profileNameEl = document.getElementById("profileName");
  var profileRoleEl = document.getElementById("profileRole");
  var profileAvatarEl = document.getElementById("profileAvatar");

  if (topNameEl) topNameEl.textContent = displayName;
  if (topRoleEl) topRoleEl.textContent = displayTitle;
  if (topAvatarEl) topAvatarEl.textContent = displayInitials;
  if (profileNameEl) profileNameEl.textContent = displayName;
  if (profileRoleEl) profileRoleEl.textContent = displayTitle;
  if (profileAvatarEl) profileAvatarEl.textContent = displayInitials;
}

// ===================== SIDEBAR NAVIGATION =====================

// grab all nav buttons and all page sections
var navButtons = document.querySelectorAll(".nav-item");
var pageSections = document.querySelectorAll(".panel");

var pageTitle = document.getElementById("pageTitle");
var pageSubtitle = document.getElementById("pageSubtitle");

// text to show in the top bar for each section
var titles = {
  dashboard: ["My workspace", "Wednesday, August 19, 2026"],
  tasks: ["My tasks", "9 tasks assigned to you."],
  leave: ["Apply for leave", "Submit a new leave request"],
  promotion: ["Apply for promotion", "Submit a new promotion request"],
  profile: ["My profile", "View and update your personal information"]
};

function showSection(name) {
  // hide every section, then show only the one we want
  for (var i = 0; i < pageSections.length; i++) {
    var section = pageSections[i];
    if (section.id === "section-" + name) {
      section.classList.remove("hidden");
    } else {
      section.classList.add("hidden");
    }
  }

  // update the active class on the sidebar buttons
  for (var j = 0; j < navButtons.length; j++) {
    if (navButtons[j].dataset.section === name) {
      navButtons[j].classList.add("active");
    } else {
      navButtons[j].classList.remove("active");
    }
  }

  // update the top bar text
  pageTitle.textContent = titles[name][0];
  pageSubtitle.textContent = titles[name][1];
}

// clicking a sidebar link switches the section
for (var k = 0; k < navButtons.length; k++) {
  navButtons[k].addEventListener("click", function () {
    showSection(this.dataset.section);
  });
}

// "View all" buttons on the dashboard jump to My tasks
var gotoButtons = document.querySelectorAll("[data-goto]");
for (var g = 0; g < gotoButtons.length; g++) {
  gotoButtons[g].addEventListener("click", function () {
    showSection(this.dataset.goto);
  });
}

document.getElementById("logoutBtn").addEventListener("click", function () {
  showToast("You have been logged out.");
  sessionStorage.removeItem("worknest_current_user");
  setTimeout(function () {
    window.location.href = "../Login/login_index.html";
  }, 600);
});

// clicking the profile picture in the top bar goes straight to My profile
document.getElementById("topAvatar").addEventListener("click", function () {
  showSection("profile");
});

// ===================== TOAST MESSAGE =====================

var toastBox = document.getElementById("toast");
var toastTimer;

function showToast(message) {
  toastBox.textContent = message;
  toastBox.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toastBox.classList.remove("show");
  }, 2500);
}

// ===================== MY TASKS TABLE =====================

var taskRows = document.querySelectorAll("#taskTableBody tr");
var searchInput = document.getElementById("taskSearch");
var filterButtons = document.querySelectorAll("#filterTabs .tab");
var activeFilter = "all";

// filter tab click
for (var f = 0; f < filterButtons.length; f++) {
  filterButtons[f].addEventListener("click", function () {
    // update the active tab style
    for (var t = 0; t < filterButtons.length; t++) {
      filterButtons[t].classList.remove("active");
    }
    this.classList.add("active");

    activeFilter = this.dataset.filter;
    filterTaskRows();
  });
}

// search box typing
searchInput.addEventListener("input", filterTaskRows);

function filterTaskRows() {
  var searchText = searchInput.value.toLowerCase();

  for (var i = 0; i < taskRows.length; i++) {
    var row = taskRows[i];
    var rowStatus = row.dataset.status;
    var rowText = row.textContent.toLowerCase();

    var matchesFilter = activeFilter === "all" || rowStatus === activeFilter;
    var matchesSearch = rowText.indexOf(searchText) !== -1;

    if (matchesFilter && matchesSearch) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  }
}

// "Accept" button - moves a task from Assigned to In progress
var acceptButtons = document.querySelectorAll(".accept-btn");
for (var a = 0; a < acceptButtons.length; a++) {
  acceptButtons[a].addEventListener("click", function () {
    var row = this.closest("tr");
    var statusCell = row.querySelector(".status-pill");
    var checkbox = row.querySelector(".task-checkbox");

    // update the row's data-status so filters still work
    row.dataset.status = "in-progress";

    // update the status pill text and color
    statusCell.textContent = "In progress";
    statusCell.className = "status-pill status-pill--progress";

    // enable the checkbox now that the task has been accepted
    checkbox.disabled = false;

    // remove the Accept button, it's no longer needed
    this.remove();

    showToast(row.children[1].textContent + " accepted - moved to In progress.");
  });
}

// checkbox click - marks a task as completed / not completed
var taskCheckboxes = document.querySelectorAll(".task-checkbox");
for (var c = 0; c < taskCheckboxes.length; c++) {
  taskCheckboxes[c].addEventListener("change", function () {
    var row = this.closest("tr");
    var statusCell = row.querySelector(".status-pill");

    if (this.checked) {
      row.dataset.status = "completed";
      row.classList.add("row-completed");
      statusCell.textContent = "Completed";
      statusCell.className = "status-pill status-pill--done";
    } else {
      row.dataset.status = "in-progress";
      row.classList.remove("row-completed");
      statusCell.textContent = "In progress";
      statusCell.className = "status-pill status-pill--progress";
    }
  });
}

// ===================== LEAVE FORM =====================

var leaveForm = document.getElementById("leaveForm");
var leaveError = document.getElementById("leaveError");
var leaveList = document.getElementById("leaveList");

leaveForm.addEventListener("submit", function (event) {
  event.preventDefault();

  var type = document.getElementById("leaveType").value;
  var start = document.getElementById("leaveStart").value;
  var end = document.getElementById("leaveEnd").value;
  var reason = document.getElementById("leaveReason").value.trim();

  // basic validation
  if (type === "" || start === "" || end === "" || reason === "") {
    leaveError.textContent = "Please fill in every field before submitting.";
    return;
  }
  if (end < start) {
    leaveError.textContent = "End date can't be earlier than the start date.";
    return;
  }
  leaveError.textContent = "";

  // build a new request card and add it to the top of the list
  var newItem = document.createElement("div");
  newItem.className = "request-item";
  newItem.innerHTML =
    "<div><h4>" + formatDate(start) + " - " + formatDate(end) + "</h4>" +
    "<p>" + type + "</p></div>" +
    "<span class='status-pill status-pill--pending'>Pending</span>";

  leaveList.insertBefore(newItem, leaveList.firstChild);

  leaveForm.reset();
  showToast("Leave request submitted to your manager.");
});

document.getElementById("leaveCancel").addEventListener("click", function () {
  leaveForm.reset();
  leaveError.textContent = "";
});

// turns "2026-08-25" into "Aug 25, 2026"
function formatDate(isoDate) {
  var date = new Date(isoDate + "T00:00:00");
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

// ===================== PROMOTION FORM =====================

var promotionForm = document.getElementById("promotionForm");
var promoError = document.getElementById("promoError");
var promoHistoryList = document.getElementById("promoHistoryList");
var promoSubmitBtn = document.getElementById("promoSubmitBtn");

promotionForm.addEventListener("submit", function (event) {
  event.preventDefault();

  var target = document.getElementById("promoTarget").value;
  var reason = document.getElementById("promoReason").value.trim();

  if (target === "" || reason === "") {
    promoError.textContent = "Please select a target position and add your justification.";
    return;
  }
  promoError.textContent = "";

  var newItem = document.createElement("div");
  newItem.className = "history-item";
  newItem.innerHTML =
    "<div><h4>Software Engineer &rarr; " + target + "</h4>" +
    "<p>Submitted just now</p></div>" +
    "<span class='status-pill status-pill--pending'>Pending</span>";

  promoHistoryList.insertBefore(newItem, promoHistoryList.firstChild);

  // only one active request at a time
  promoSubmitBtn.disabled = true;
  promoSubmitBtn.textContent = "Request already submitted";

  showToast("Promotion request sent to your manager.");
});

document.getElementById("promoCancel").addEventListener("click", function () {
  promotionForm.reset();
  promoError.textContent = "";
});

// ===================== CHANGE PHOTO =====================

var changePhotoBtn = document.getElementById("changePhotoBtn");
var photoInput = document.getElementById("photoInput");

// clicking the visible button opens the hidden file picker
changePhotoBtn.addEventListener("click", function () {
  photoInput.click();
});

// once the user picks a file, show it as the avatar image
photoInput.addEventListener("change", function () {
  var file = photoInput.files[0];
  if (!file) {
    return;
  }

  var reader = new FileReader();
  reader.onload = function () {
    var imageUrl = "url(" + reader.result + ")";

    var topAvatar = document.getElementById("topAvatar");
    var profileAvatar = document.getElementById("profileAvatar");

    topAvatar.style.backgroundImage = imageUrl;
    profileAvatar.style.backgroundImage = imageUrl;

    // hide the initials text once a real photo is set
    topAvatar.textContent = "";
    profileAvatar.textContent = "";

    showToast("Profile photo updated.");
  };
  reader.readAsDataURL(file);
});

// ===================== PROFILE FORM =====================

var profileForm = document.getElementById("profileForm");
var phoneInput = document.getElementById("pfPhone");
var phoneError = document.getElementById("phoneError");
var emailInput = document.getElementById("pfEmail");
var emailError = document.getElementById("emailError");

// accepts things like +880 171 234 5678, (880) 171-234-5678, 01712345678
// just checks the digit count is reasonable, not a specific country format
function isValidPhone(value) {
  var digitsOnly = value.replace(/\D/g, "");
  var allowedChars = /^\+880\s1[3-9]\d{8}$/;

  return allowedChars.test(value) && digitsOnly.length === 13;
}

// simple check: something@something.something
function isValidEmail(value) {
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value);
}

// live validation - runs as soon as the user leaves the field
phoneInput.addEventListener("blur", function () {
  var phone = phoneInput.value.trim();
  if (phone !== "" && !isValidPhone(phone)) {
    phoneError.textContent = "Enter a valid phone number (+880 1xxxxxxxxx).";
  } else {
    phoneError.textContent = "";
  }
});

emailInput.addEventListener("blur", function () {
  var email = emailInput.value.trim();
  if (email !== "" && !isValidEmail(email)) {
    emailError.textContent = "Enter a valid email address, e.g. name@example.com";
  } else {
    emailError.textContent = "";
  }
});

profileForm.addEventListener("submit", function (event) {
  event.preventDefault();

  var name = document.getElementById("pfName").value.trim();
  var role = document.getElementById("pfTitle").value;
  var phone = phoneInput.value.trim();
  var email = emailInput.value.trim();

  if (name === "") {
    showToast("Full name can't be empty.");
    return;
  }

  // email is required
  if (email === "" || !isValidEmail(email)) {
    emailError.textContent = "Enter a valid email address, e.g. name@example.com";
    return;
  }
  emailError.textContent = "";

  // phone is optional, but if something is typed it must look like a real number
  if (phone !== "" && !isValidPhone(phone)) {
    phoneError.textContent = "Enter a valid phone number (+880 1xxxxxxxxx).";
    return;
  }
  phoneError.textContent = "";

  // build initials from the first two words of the name
  var words = name.split(" ");
  var initials = "";
  for (var w = 0; w < words.length && initials.length < 2; w++) {
    if (words[w].length > 0) {
      initials += words[w][0].toUpperCase();
    }
  }

  document.getElementById("topName").textContent = name;
  document.getElementById("profileName").textContent = name;
  document.getElementById("topRole").textContent = role;
  document.getElementById("profileRole").textContent = role;

  // only fall back to initials if no photo has been set
  var topAvatar = document.getElementById("topAvatar");
  var profileAvatar = document.getElementById("profileAvatar");
  if (!topAvatar.style.backgroundImage) {
    topAvatar.textContent = initials;
    profileAvatar.textContent = initials;
  }

  showToast("Profile updated.");
});

document.getElementById("profileCancel").addEventListener("click", function () {
  profileForm.reset();
  showToast("Changes discarded.");
});

// ===================== INIT =====================

// don't allow picking a leave date in the past
var today = new Date().toISOString().split("T")[0];
document.getElementById("leaveStart").min = today;
document.getElementById("leaveEnd").min = today;
