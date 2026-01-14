/* Student Registration & Fee System
 * - Vanilla JS only (No frameworks)
 * - DOM manipulation + event handling
 * - Validation + user feedback
 * - Arrays/Objects data handling
 */

"use strict";

// -------------------- DOM --------------------
const form = document.getElementById("studentForm");
const studentName = document.getElementById("studentName");
const studentId = document.getElementById("studentId");
const courseName = document.getElementById("courseName");
const feeAmount = document.getElementById("feeAmount");
const paidAmount = document.getElementById("paidAmount");
// const agreement = document.getElementById("agreement"); // Removed

const messageBox = document.getElementById("messageBox");

const tbody = document.getElementById("studentsTbody");
const emptyState = document.getElementById("emptyState");

const totalStudentsEl = document.getElementById("totalStudents");
const totalFeeEl = document.getElementById("totalFee");
const totalPaidEl = document.getElementById("totalPaid");
const totalRemainingEl = document.getElementById("totalRemaining");

const searchInput = document.getElementById("searchInput");

const btnClear = document.getElementById("btnClear");
const btnResetAll = document.getElementById("btnResetAll");

// -------------------- DATA --------------------
let students = []; // array of objects

// -------------------- HELPERS --------------------
function money(n) {
    const num = Number(n);
    if (!Number.isFinite(num)) return "$0.00";
    return "$" + num.toFixed(2);
}

function safeTrim(v) {
    return String(v ?? "").trim();
}

function todayString() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function showMessage(type, text) {
    messageBox.className = "message";
    if (type === "ok") messageBox.classList.add("ok");
    if (type === "err") messageBox.classList.add("err");
    messageBox.textContent = text;
    messageBox.style.display = "block";

    // auto hide after 4s
    window.clearTimeout(showMessage._t);
    showMessage._t = window.setTimeout(() => {
        messageBox.style.display = "none";
    }, 4000);
}

function badgeForAgreement(val) {
    if (val === "Full Payment") return `<span class="badge full">Full</span>`;
    if (val === "Installment") return `<span class="badge inst">Installment</span>`;
    if (val === "Scholarship") return `<span class="badge scho">Scholarship</span>`;
    if (val === "Not Paid") return `<span class="badge warn">Not Paid</span>`;
    return `<span class="badge">${val}</span>`;
}

function parsePositiveNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : NaN;
}

function isValidName(name) {
    // letters + spaces only (basic). You can allow Somali letters as well by relaxing this regex.
    return /^[A-Za-z\s]+$/.test(name);
}

// -------------------- VALIDATION --------------------
function validateForm() {
    const name = safeTrim(studentName.value);
    const sid = safeTrim(studentId.value);
    const course = safeTrim(courseName.value);
    // const agree = safeTrim(agreement.value); // Removed

    const fee = parsePositiveNumber(feeAmount.value);
    const paid = parsePositiveNumber(paidAmount.value);

    // Auto-calculate Agreement
    let autoAgreement = "Pending";
    if (fee === 0) {
        autoAgreement = "Scholarship";
    } else if (paid >= fee) {
        autoAgreement = "Full Payment";
    } else if (paid === 0) {
        autoAgreement = "Not Paid"; // or "Pending"
    } else {
        autoAgreement = "Installment";
    }

    if (!name || !sid || !course) {
        return { ok: false, msg: "Please fill all fields (Name, ID, Course)." };
    }

    if (!isValidName(name)) {
        return { ok: false, msg: "Student name must contain letters and spaces only." };
    }

    if (!Number.isFinite(fee) || fee < 0) {
        return { ok: false, msg: "Fee must be a valid number (0 or more)." };
    }

    if (!Number.isFinite(paid) || paid < 0) {
        return { ok: false, msg: "Paid must be a valid number (0 or more)." };
    }

    if (paid > fee) {
        return { ok: false, msg: "Paid amount cannot exceed Fee amount." };
    }

    // Unique ID check
    const exists = students.some(s => s.studentId.toLowerCase() === sid.toLowerCase());
    if (exists) {
        return { ok: false, msg: "Student ID already exists. Use a unique ID." };
    }

    return {
        ok: true,
        data: {
            id: cryptoRandomId(),
            studentName: name,
            studentId: sid,
            courseName: course,
            fee,
            paid,
            remaining: fee - paid,
            paid,
            remaining: fee - paid,
            agreement: autoAgreement,
            date: todayString()
        }
    };
}

function cryptoRandomId() {
    // Safe random id (fallback if crypto not available)
    if (window.crypto && crypto.getRandomValues) {
        const arr = new Uint32Array(2);
        crypto.getRandomValues(arr);
        return `S-${arr[0].toString(16)}${arr[1].toString(16)}`;
    }
    return "S-" + Math.random().toString(16).slice(2);
}

// -------------------- RENDER --------------------
function renderTable(list) {
    tbody.innerHTML = "";

    if (!list.length) {
        emptyState.style.display = "block";
        return;
    }
    emptyState.style.display = "none";

    list.forEach((s, idx) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${escapeHtml(s.studentName)}</td>
      <td>${escapeHtml(s.studentId)}</td>
      <td>${escapeHtml(s.courseName)}</td>
      <td class="right">${money(s.fee)}</td>
      <td class="right">${money(s.paid)}</td>
      <td class="right">${money(s.remaining)}</td>
      <td>${badgeForAgreement(s.agreement)}</td>
      <td>${escapeHtml(s.date)}</td>
      <td class="center">
        <button class="btn danger" data-action="delete" data-id="${s.id}">Delete</button>
      </td>
    `;

        tbody.appendChild(tr);
    });
}

function renderStats() {
    const totalStudents = students.length;
    const totalFee = students.reduce((sum, s) => sum + s.fee, 0);
    const totalPaid = students.reduce((sum, s) => sum + s.paid, 0);
    const totalRemaining = students.reduce((sum, s) => sum + s.remaining, 0);

    totalStudentsEl.textContent = String(totalStudents);
    totalFeeEl.textContent = money(totalFee);
    totalPaidEl.textContent = money(totalPaid);
    totalRemainingEl.textContent = money(totalRemaining);
}

function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// -------------------- ACTIONS --------------------
function addStudent(studentObj) {
    students.push(studentObj);
    applyFilterAndRender();
    renderStats();
}

function deleteStudentById(id) {
    students = students.filter(s => s.id !== id);
    applyFilterAndRender();
    renderStats();
}

function clearForm() {
    form.reset();
    studentName.focus();
}

function resetAll() {
    students = [];
    applyFilterAndRender();
    renderStats();
    showMessage("ok", "All records cleared.");
}

// -------------------- SEARCH --------------------
function applyFilterAndRender() {
    const q = safeTrim(searchInput.value).toLowerCase();

    if (!q) {
        renderTable(students);
        return;
    }

    const filtered = students.filter(s => {
        return (
            s.studentName.toLowerCase().includes(q) ||
            s.studentId.toLowerCase().includes(q) ||
            s.courseName.toLowerCase().includes(q) ||
            s.courseName.toLowerCase().includes(q) ||
            (s.agreement && s.agreement.toLowerCase().includes(q))
        );
    });

    renderTable(filtered);
}

// -------------------- EVENTS --------------------
studentName.addEventListener("input", (e) => {
    // Real-time validation: reject numbers
    const val = e.target.value;
    if (/\d/.test(val)) {
        // Remove numbers immediately
        e.target.value = val.replace(/\d/g, "");
        showMessage("err", "Digits are not allowed in Name!");
    }
});

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const result = validateForm();
    if (!result.ok) {
        showMessage("err", result.msg);
        return;
    }

    addStudent(result.data);
    showMessage("ok", "Student added successfully ✅");
    clearForm();
});

btnClear.addEventListener("click", () => {
    clearForm();
    showMessage("ok", "Form cleared.");
});

btnResetAll.addEventListener("click", () => {
    const sure = confirm("Are you sure you want to reset ALL students?");
    if (sure) resetAll();
});

tbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === "delete") {
        const sure = confirm("Delete this student?");
        if (sure) {
            deleteStudentById(id);
            showMessage("ok", "Student deleted.");
        }
    }
});

searchInput.addEventListener("input", () => {
    applyFilterAndRender();
});

// initial render
applyFilterAndRender();
renderStats();

