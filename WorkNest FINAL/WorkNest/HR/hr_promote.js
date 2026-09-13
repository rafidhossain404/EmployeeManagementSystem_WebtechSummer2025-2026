document.addEventListener("DOMContentLoaded", function () {
  renderPromotions();
  renderHistory();
});

function renderPromotions() {
  const W = window.WORKNEST;
  const list = W.promotions.filter((p) => p.Status === "Processing");
  const container = document.getElementById("hrPromote_list");
  const countBadge = document.getElementById("hrPromote_count");
  countBadge.textContent = `${list.length} requests`;

  if (list.length === 0) {
    container.innerHTML = `<div class="hrPromote_empty"><p style="font-size: 16px;">No requests found</p></div>`;
    return;
  }

  const roleOptions = Object.entries(W.availableRoles)
    .map(([key, label]) => `<option value="${key}">${label}</option>`)
    .join("");

  container.innerHTML = list.map((promo) => {
    const promoID = promo.PromotionID;
    return `
        <div class="hrPromote_item">
            <div class="hrPromote_itemHeader">
                <span class="hrPromote_itemName">${promo.FirstName} ${promo.LastName}</span>
                <span class="hrPromote_badge hrPromote_badge_${promo.Status.toLowerCase()}">${promo.Status}</span>
            </div>
            <div class="hrPromote_itemDetails">
                <span> ${promo.Dept || "N/A"}</span>
                <span>Current: ${promo.Role || "N/A"}</span>
                <span> ${formatDate(promo.PromotionDate)}</span>
            </div>

            <div id="hrPhase1_${promoID}" class="hrPromote_itemActions">
                <button type="button" onclick="showPhase2(${promoID})" class="hrAction_btn hrAction_btn_approve">Approve</button>
                <button type="button" onclick="handlePromotionAction(${promoID}, 'Rejected')" class="hrAction_btn hrAction_btn_reject">Reject</button>
            </div>

            <div id="hrPhase2_${promoID}" class="hrPromote_itemActions" style="display: none;">
                <label style="font-size: 13px; color: #4b5164; font-weight: 500;">New Role:</label>
                <select id="hrRole_${promoID}">
                    <option value="">Select Role...</option>
                    ${roleOptions}
                </select>

                <label style="font-size: 13px; color: #4b5164; font-weight: 500;">New Salary:</label>
                <input type="number" step="0.01" id="hrSalary_${promoID}" placeholder="Optional" min="0">

                <button type="button" onclick="submitApproval(${promoID})" class="hrAction_btn hrAction_btn_approve">Approve</button>
                <button type="button" onclick="showPhase1(${promoID})" class="hrAction_btn hrAction_btn_processing">Cancel</button>
            </div>
        </div>`;
  }).join("");
}

function renderHistory() {
  const W = window.WORKNEST;
  const history = [...W.promotions].sort((a, b) => new Date(b.PromotionDate) - new Date(a.PromotionDate));
  document.getElementById("hrHistory_count").textContent = `${history.length} records`;
  const container = document.getElementById("hrHistory_list");

  if (history.length === 0) {
    container.innerHTML = `<div class="hrPromote_empty"><p>No promotion history available</p></div>`;
    return;
  }

  container.innerHTML = `<table class="hrPromote_table">
        <thead><tr><th>Employee</th><th>Department</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
            ${history.map((h) => `
                <tr>
                    <td><strong>${h.FirstName} ${h.LastName}</strong></td>
                    <td>${h.Dept || "N/A"}</td>
                    <td><span class="hrPromote_badge hrPromote_badge_${h.Status.toLowerCase()}">${h.Status}</span></td>
                    <td>${formatDate(h.PromotionDate)}</td>
                </tr>`).join("")}
        </tbody>
    </table>`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

// Phase 1 to Phase 2 (Show fields for Approve)
function showPhase2(promoID) {
  document.getElementById("hrPhase1_" + promoID).style.display = "none";
  document.getElementById("hrPhase2_" + promoID).style.display = "flex";
}

// Phase 2 to Phase 1 (Cancel - Return to initial buttons)
function showPhase1(promoID) {
  document.getElementById("hrPhase2_" + promoID).style.display = "none";
  document.getElementById("hrPhase1_" + promoID).style.display = "flex";
  document.getElementById("hrRole_" + promoID).value = "";
}

function submitApproval(promoID) {
  const role = document.getElementById("hrRole_" + promoID).value;
  const salary = parseFloat(document.getElementById("hrSalary_" + promoID).value);

  if (!role) {
    alert("Please select a new role for the promotion.");
    return;
  }

  const promo = window.WORKNEST.promotions.find((p) => p.PromotionID === promoID);
  const emp = window.WORKNEST.findEmployee(promo.EmployeeID);

  promo.Status = "Approved";
  promo.Role = role;
  if (emp) {
    emp.Role = role;
    if (!isNaN(salary) && salary > 0) emp.Salary = salary;
  }

  renderPromotions();
  renderHistory();
}

function handlePromotionAction(promoID, action) {
  const promo = window.WORKNEST.promotions.find((p) => p.PromotionID === promoID);
  if (!promo) return;
  promo.Status = action;
  renderPromotions();
  renderHistory();
}
