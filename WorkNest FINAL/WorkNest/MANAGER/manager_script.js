// ===================== SESSION GUARD =====================
// If nobody is signed in, OR the person who is signed in is an
// employee (not a manager), send them back to the login page
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

if (!currentUser || currentUser.role !== "manager") {
  window.location.href = "../Login/login_index.html";
}

// Personalize EVERY place the user's name/title/initials show up,
// using whoever actually signed in (not the hardcoded HTML defaults).
// NOTE: getInitials() is defined further down in this file, but that's
// OK — function declarations are "hoisted" so it can be called here.
if (currentUser) {
  var displayName = currentUser.name;
  var displayTitle = currentUser.title || "Manager";
  var displayInitials = getInitials(displayName);

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

var navButtons = document.querySelectorAll(".nav-item");
var pageSections = document.querySelectorAll(".panel");

var pageTitle = document.getElementById("pageTitle");
var pageSubtitle = document.getElementById("pageSubtitle");

var todayText = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});

var titles = {
  dashboard: ["Manager dashboard", todayText + " - Engineering team"],
  team: ["My team", "5 direct reports - Engineering department"],
  tasks: ["Team tasks", "7 tasks across your team"],
  "leave-review": ["Leave review", "2 pending, 4 total from your team"],
  "promotion-review": ["Promotion review", "1 pending, 3 total from your team"],
  "leave-apply": ["Leave application", "Submit your own leave request"],
  profile: ["My profile", "View and update your personal information"]
};

function showSection(name) {
  for (var i = 0; i < pageSections.length; i++) {
    var section = pageSections[i];
    if (section.id === "section-" + name) {
      section.classList.remove("hidden");
    } else {
      section.classList.add("hidden");
    }
  }

  for (var j = 0; j < navButtons.length; j++) {
    if (navButtons[j].dataset.section === name) {
      navButtons[j].classList.add("active");
    } else {
      navButtons[j].classList.remove("active");
    }
  }

  pageTitle.textContent = titles[name][0];
  pageSubtitle.textContent = titles[name][1];
}

for (var k = 0; k < navButtons.length; k++) {
  navButtons[k].addEventListener("click", function () {
    showSection(this.dataset.section);
  });
}

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

// Personalize the top bar with whoever just signed in.
if (currentUser) {
  var topNameEl = document.getElementById("topName");
  if (topNameEl) topNameEl.textContent = currentUser.name;
}

document.getElementById("topAvatar").addEventListener("click", function () {
  showSection("profile");
});

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

var teamCards = document.querySelectorAll("#teamGrid .team-card");
var teamSearch = document.getElementById("teamSearch");
var teamFilterButtons = document.querySelectorAll("#teamFilterTabs .tab");
var activeTeamFilter = "all";

for (var tf = 0; tf < teamFilterButtons.length; tf++) {
  teamFilterButtons[tf].addEventListener("click", function () {
    for (var t = 0; t < teamFilterButtons.length; t++) {
      teamFilterButtons[t].classList.remove("active");
    }
    this.classList.add("active");
    activeTeamFilter = this.dataset.filter;
    filterTeamCards();
  });
}

teamSearch.addEventListener("input", filterTeamCards);

function filterTeamCards() {
  var searchText = teamSearch.value.toLowerCase();

  for (var i = 0; i < teamCards.length; i++) {
    var card = teamCards[i];
    var cardStatus = card.dataset.status;
    var cardText = card.textContent.toLowerCase();

    var matchesFilter = activeTeamFilter === "all" || cardStatus === activeTeamFilter;
    var matchesSearch = cardText.indexOf(searchText) !== -1;

    card.style.display = matchesFilter && matchesSearch ? "" : "none";
  }
}

var taskRows = document.querySelectorAll("#taskTableBody tr");
var taskSearch = document.getElementById("taskSearch");
var taskFilterButtons = document.querySelectorAll("#taskFilterTabs .tab");
var activeTaskFilter = "all";

for (var f = 0; f < taskFilterButtons.length; f++) {
  taskFilterButtons[f].addEventListener("click", function () {
    for (var t = 0; t < taskFilterButtons.length; t++) {
      taskFilterButtons[t].classList.remove("active");
    }
    this.classList.add("active");
    activeTaskFilter = this.dataset.filter;
    filterTaskRows();
  });
}

taskSearch.addEventListener("input", filterTaskRows);

function filterTaskRows() {
  var searchText = taskSearch.value.toLowerCase();
  var rows = document.querySelectorAll("#taskTableBody tr");

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var rowStatus = row.dataset.status;
    var rowText = row.textContent.toLowerCase();

    var matchesFilter = activeTaskFilter === "all" || rowStatus === activeTaskFilter;
    var matchesSearch = rowText.indexOf(searchText) !== -1;

    row.style.display = matchesFilter && matchesSearch ? "" : "none";
  }
}

var newTaskModal = document.getElementById("newTaskModal");
var newTaskBtn = document.getElementById("newTaskBtn");
var modalClose = document.getElementById("modalClose");
var modalCancel = document.getElementById("modalCancel");
var newTaskForm = document.getElementById("newTaskForm");
var taskTableBody = document.getElementById("taskTableBody");
var taskCounter = 13; // next task number after MT-012

newTaskBtn.addEventListener("click", function () {
  newTaskModal.classList.remove("hidden");
});

function closeModal() {
  newTaskModal.classList.add("hidden");
  newTaskForm.reset();
}

modalClose.addEventListener("click", closeModal);
modalCancel.addEventListener("click", closeModal);

// clicking the dark overlay itself (not the modal box) also closes it
newTaskModal.addEventListener("click", function (event) {
  if (event.target === newTaskModal) {
    closeModal();
  }
});

newTaskForm.addEventListener("submit", function (event) {
  event.preventDefault();

  var title = document.getElementById("ntTitle").value.trim();
  var assignee = document.getElementById("ntAssignee").value;
  var project = document.getElementById("ntProject").value;
  var priority = document.getElementById("ntPriority").value;
  var dueDateRaw = document.getElementById("ntDueDate").value;

  if (title === "" || dueDateRaw === "") {
    showToast("Please fill in the task title and due date.");
    return;
  }

  var priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);
  var initials = getInitials(assignee);
  var taskId = "MT-0" + taskCounter;
  taskCounter++;

  var newRow = document.createElement("tr");
  newRow.dataset.status = "pending";
  newRow.innerHTML =
    "<td>" + taskId + "</td>" +
    "<td class='task-title'>" + title + "</td>" +
    "<td><div class='cell-assignee'><span class='avatar avatar--sm'>" + initials + "</span>" + assignee + "</div></td>" +
    "<td>" + project + "</td>" +
    "<td><span class='priority priority--" + priority + "'>" + priorityLabel + "</span></td>" +
    "<td>" + formatDate(dueDateRaw) + "</td>" +
    "<td><span class='status-pill status-pill--assigned'>Pending</span></td>";

  taskTableBody.insertBefore(newRow, taskTableBody.firstChild);

  closeModal();
  showToast(taskId + " created and assigned to " + assignee + ".");
});

function getInitials(fullName) {
  var words = fullName.split(" ");
  var initials = "";
  for (var w = 0; w < words.length && initials.length < 2; w++) {
    if (words[w].length > 0) {
      initials += words[w][0].toUpperCase();
    }
  }
  return initials;
}

setupReviewList("#leaveReviewList", "#leaveReviewTabs");
setupReviewList("#promoReviewList", "#promoReviewTabs");

function setupReviewList(listSelector, tabsSelector) {
  var list = document.querySelector(listSelector);
  var tabs = document.querySelectorAll(tabsSelector + " .tab");
  var activeFilter = "all";

  for (var t = 0; t < tabs.length; t++) {
    tabs[t].addEventListener("click", function () {
      for (var x = 0; x < tabs.length; x++) {
        tabs[x].classList.remove("active");
      }
      this.classList.add("active");
      activeFilter = this.dataset.filter;
      filterReviewCards(list, activeFilter);
    });
  }

  // event delegation: one listener on the list handles every
  // approve/reject/undo button, including ones added later
  list.addEventListener("click", function (event) {
    var card = event.target.closest(".review-card");
    if (!card) return;

    if (event.target.classList.contains("approve-btn")) {
      setReviewStatus(card, "approved");
      showToast("Request approved.");
    } else if (event.target.classList.contains("reject-btn")) {
      setReviewStatus(card, "rejected");
      showToast("Request rejected.");
    } else if (event.target.classList.contains("undo-btn")) {
      setReviewStatus(card, "pending");
      showToast("Decision undone, request is pending again.");
    }

    filterReviewCards(list, activeFilter);
  });
}

function filterReviewCards(list, activeFilter) {
  var cards = list.querySelectorAll(".review-card");
  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    var matches = activeFilter === "all" || card.dataset.status === activeFilter;
    card.style.display = matches ? "" : "none";
  }
}

function setReviewStatus(card, status) {
  card.dataset.status = status;
  var actionsBox = card.querySelector(".review-actions");

  if (status === "pending") {
    actionsBox.innerHTML =
      "<span class='status-pill status-pill--pending'>Pending</span>" +
      "<button class='approve-btn'>Approve</button>" +
      "<button class='reject-btn'>Reject</button>";
  } else if (status === "approved") {
    actionsBox.innerHTML =
      "<span class='status-pill status-pill--done'>Approved</span>" +
      "<button class='undo-btn'>Undo</button>";
  } else if (status === "rejected") {
    actionsBox.innerHTML =
      "<span class='status-pill status-pill--rejected'>Rejected</span>" +
      "<button class='undo-btn'>Undo</button>";
  }
}

// ===================== LEAVE APPLICATION (manager's own) =====================

var leaveForm = document.getElementById("leaveForm");
var leaveError = document.getElementById("leaveError");
var leaveList = document.getElementById("leaveList");

leaveForm.addEventListener("submit", function (event) {
  event.preventDefault();

  var type = document.getElementById("leaveType").value;
  var start = document.getElementById("leaveStart").value;
  var end = document.getElementById("leaveEnd").value;
  var reason = document.getElementById("leaveReason").value.trim();

  if (type === "" || start === "" || end === "" || reason === "") {
    leaveError.textContent = "Please fill in every field before submitting.";
    return;
  }
  if (end < start) {
    leaveError.textContent = "End date can't be earlier than the start date.";
    return;
  }
  leaveError.textContent = "";

  var newItem = document.createElement("div");
  newItem.className = "request-item";
  newItem.innerHTML =
    "<div><h4>" + formatDate(start) + " - " + formatDate(end) + "</h4>" +
    "<p>" + type + "</p></div>" +
    "<span class='status-pill status-pill--pending'>Pending</span>";

  leaveList.insertBefore(newItem, leaveList.firstChild);

  leaveForm.reset();
  showToast("Leave request submitted to HR.");
});

document.getElementById("leaveCancel").addEventListener("click", function () {
  leaveForm.reset();
  leaveError.textContent = "";
});

function formatDate(isoDate) {
  var date = new Date(isoDate + "T00:00:00");
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

var changePhotoBtn = document.getElementById("changePhotoBtn");
var photoInput = document.getElementById("photoInput");

changePhotoBtn.addEventListener("click", function () {
  photoInput.click();
});

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

    topAvatar.textContent = "";
    profileAvatar.textContent = "";

    showToast("Profile photo updated.");
  };
  reader.readAsDataURL(file);
});

var profileForm = document.getElementById("profileForm");
var phoneInput = document.getElementById("pfPhone");
var phoneError = document.getElementById("phoneError");
var emailInput = document.getElementById("pfEmail");
var emailError = document.getElementById("emailError");

function isValidPhone(value) {
  var digitsOnly = value.replace(/\D/g, "");
  var allowedChars = /^[0-9+\-() ]*$/;
  return allowedChars.test(value) && digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

function isValidEmail(value) {
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value);
}

phoneInput.addEventListener("blur", function () {
  var phone = phoneInput.value.trim();
  if (phone !== "" && !isValidPhone(phone)) {
    phoneError.textContent = "Enter a valid phone number, digits only (plus optional +, -, spaces, brackets).";
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

  if (email === "" || !isValidEmail(email)) {
    emailError.textContent = "Enter a valid email address, e.g. name@example.com";
    return;
  }
  emailError.textContent = "";

  if (phone !== "" && !isValidPhone(phone)) {
    phoneError.textContent = "Enter a valid phone number, digits only (plus optional +, -, spaces, brackets).";
    return;
  }
  phoneError.textContent = "";

  var initials = getInitials(name);

  document.getElementById("topName").textContent = name;
  document.getElementById("profileName").textContent = name;
  document.getElementById("topRole").textContent = role;
  document.getElementById("profileRole").textContent = role;

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


var today = new Date().toISOString().split("T")[0];
document.getElementById("leaveStart").min = today;
document.getElementById("leaveEnd").min = today;
document.getElementById("ntDueDate").min = today;

pageSubtitle.textContent = titles.dashboard[1];