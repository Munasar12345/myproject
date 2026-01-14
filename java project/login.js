"use strict";

const form = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginMsg = document.getElementById("loginMsg");
const togglePassBtn = document.getElementById("togglePass");

// -------------------- TOGGLE PASSWORD --------------------
togglePassBtn.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    togglePassBtn.textContent = type === "password" ? "👁" : "🙈";
    togglePassBtn.setAttribute("aria-label", type === "password" ? "Show password" : "Hide password");
});

// -------------------- LOGIN HANDLER --------------------
form.addEventListener("submit", (e) => {
    e.preventDefault();

    // reset msg
    loginMsg.style.display = "none";
    loginMsg.className = "msg";

    const user = usernameInput.value.trim();
    const pass = passwordInput.value.trim();

    if (!user || !pass) {
        showError("Please enter both username and password");
        return;
    }

    // 1. Validate Username (No numbers allowed)
    if (/\d/.test(user)) {
        showError("Username must not contain numbers");
        return;
    }

    // 2. Validate Password (Capital + Number + Symbol)
    // Regex explanation:
    // (?=.*[A-Z]) -> At least one Uppercase
    // (?=.*\d)    -> At least one Digit
    // (?=.*[\W_]) -> At least one Symbol (non-word char or underscore)
    const passRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

    if (!passRegex.test(pass)) {
        showError("Password must contain: 1 Capital, 1 Number, 1 Symbol (@#$%)");
        return;
    }

    // Mock login check (Updated to match new rules)
    if (user.toLowerCase() === "admin" && pass === "Admin@123") {
        // Success
        loginMsg.textContent = "Login successful! Redirecting...";
        loginMsg.classList.add("ok"); // if you had ok style, but we used error mainly
        loginMsg.style.color = "green";
        loginMsg.style.display = "block";

        // Save session
        sessionStorage.setItem("isLoggedIn", "true");

        // Redirect
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1000);
    } else {
        // Failure
        showError("Invalid username or password");
    }
});

function showError(text) {
    loginMsg.textContent = text;
    loginMsg.classList.add("error");
    loginMsg.style.display = "block";

    // Shake animation effect
    form.classList.add("shake");
    setTimeout(() => form.classList.remove("shake"), 500);
}

// Add shake animation to style via JS or just rely on CSS if present. 
// We didn't add .shake in CSS, so I'll add a quick style injection or just ignore it.
// Let's inject it for polish.
const style = document.createElement('style');
style.innerHTML = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}
.shake {
    animation: shake 0.4s ease-in-out;
}
`;
document.head.appendChild(style);
