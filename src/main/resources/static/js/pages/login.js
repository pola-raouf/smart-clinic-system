/* ================================================
login.js – Smart Clinic Login Page (FINAL)
================================================ */

document.addEventListener('DOMContentLoaded', () => {

/* ─────────────────────────────────────────
   1. SHOW / HIDE PASSWORD
───────────────────────────────────────── */
const passwordInput = document.getElementById('password');
const toggleBtn     = document.getElementById('toggle-password');
const toggleIcon    = document.getElementById('toggle-icon');

if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        toggleIcon.className = isPassword
            ? 'ph-bold ph-eye-slash'
            : 'ph-bold ph-eye';
        toggleBtn.setAttribute(
            'aria-label',
            isPassword ? 'Hide password' : 'Show password'
        );
    });
}

/* ─────────────────────────────────────────
   2. FORM VALIDATION
───────────────────────────────────────── */
const form        = document.getElementById('login-form');
const emailInput  = document.getElementById('email');
const loginBtn    = document.getElementById('btn-login');
const emailError  = document.getElementById('email-error');
const passError   = document.getElementById('password-error');

function showError(el, msg) {
    if (el) el.textContent = msg;
}

function clearError(el) {
    if (el) el.textContent = '';
}

function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

// Email validation
emailInput?.addEventListener('blur', () => {
    if (!emailInput.value.trim()) {
        showError(emailError, 'Email is required.');
    } else if (!validateEmail(emailInput.value)) {
        showError(emailError, 'Invalid email format.');
    } else {
        clearError(emailError);
    }
});

emailInput?.addEventListener('input', () => clearError(emailError));

// Password validation
passwordInput?.addEventListener('blur', () => {
    if (!passwordInput.value) {
        showError(passError, 'Password is required.');
    } else if (passwordInput.value.length < 6) {
        showError(passError, 'Minimum 6 characters.');
    } else {
        clearError(passError);
    }
});

passwordInput?.addEventListener('input', () => clearError(passError));

/* ─────────────────────────────────────────
   3. SUBMIT LOGIN
───────────────────────────────────────── */
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        let valid = true;

        // Validate email
        if (!emailInput.value.trim()) {
            showError(emailError, 'Email is required.');
            valid = false;
        } else if (!validateEmail(emailInput.value)) {
            showError(emailError, 'Invalid email.');
            valid = false;
        } else {
            clearError(emailError);
        }

        // Validate password
        if (!passwordInput.value) {
            showError(passError, 'Password is required.');
            valid = false;
        } else if (passwordInput.value.length < 6) {
            showError(passError, 'Minimum 6 characters.');
            valid = false;
        } else {
            clearError(passError);
        }

        if (!valid) return;

        // UI loading state
        loginBtn.classList.add('loading');
        loginBtn.disabled = true;

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: emailInput.value.trim(),
                    password: passwordInput.value
                })
            });

            if (!res.ok) {
                let msg = "Invalid credentials";
                try {
                    const errBody = await res.json();
                    if (errBody && errBody.message) msg = errBody.message;
                } catch {
                    /* ignore */
                }
                throw new Error(msg);
            }

            // 🔥 IMPORTANT: backend returns { token, role }
            const data = await res.json();

            // SAVE
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);

            const routes = {
                PATIENT: "/pages/patient/dashboard.html",
                DOCTOR: "/pages/doctor/dashboard.html",
                OWNER: "/pages/owner/dashboard.html",
                SECRETARY: "/pages/secretary/dashboard.html",
            };

            window.location.href = routes[data.role] || "/index.html";

        } catch (err) {
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
            showError(passError, err.message || 'Login failed.');
        }
    });
}

/* ─────────────────────────────────────────
   4. NAVBAR INIT
───────────────────────────────────────── */
if (window.initSmartClinicNavbar) {
    window.initSmartClinicNavbar();
}

});
