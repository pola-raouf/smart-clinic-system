/* ================================================
   register.js – Smart Clinic patient self-registration
   ================================================ */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("register-form");
    const btn = document.getElementById("btn-register");
    const spinner = document.getElementById("reg-spinner");

    const fullName = document.getElementById("full-name");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirm = document.getElementById("confirm-password");
    const phone = document.getElementById("phone");
    const dob = document.getElementById("dob");
    const gender = document.getElementById("gender");
    const address = document.getElementById("address");
    const terms = document.getElementById("terms");

    const nameError = document.getElementById("name-error");
    const emailError = document.getElementById("email-error");
    const passError = document.getElementById("pass-error");
    const confirmError = document.getElementById("confirm-error");
    const phoneError = document.getElementById("phone-error");
    const dobError = document.getElementById("dob-error");
    const genderError = document.getElementById("gender-error");
    const termsError = document.getElementById("terms-error");

    function show(el, msg) {
        if (el) el.textContent = msg || "";
    }
    function clear(el) {
        if (el) el.textContent = "";
    }

    document.getElementById("toggle-pass")?.addEventListener("click", () => {
        const on = password.type === "password";
        password.type = on ? "text" : "password";
        const icon = document.getElementById("toggle-pass-icon");
        if (icon) icon.className = on ? "ph-bold ph-eye-slash" : "ph-bold ph-eye";
    });
    document.getElementById("toggle-confirm")?.addEventListener("click", () => {
        const on = confirm.type === "password";
        confirm.type = on ? "text" : "password";
        const icon = document.getElementById("toggle-confirm-icon");
        if (icon) icon.className = on ? "ph-bold ph-eye-slash" : "ph-bold ph-eye";
    });

    function validateEmail(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || "").trim());
    }

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        clear(nameError);
        clear(emailError);
        clear(passError);
        clear(confirmError);
        clear(phoneError);
        clear(dobError);
        clear(genderError);
        clear(termsError);

        let ok = true;
        if (!fullName?.value.trim()) {
            show(nameError, "Full name is required.");
            ok = false;
        }
        if (!email?.value.trim() || !validateEmail(email.value)) {
            show(emailError, "Valid email is required.");
            ok = false;
        }
        if (!password?.value || password.value.length < 8) {
            show(passError, "Password must be at least 8 characters.");
            ok = false;
        }
        if (password?.value !== confirm?.value) {
            show(confirmError, "Passwords do not match.");
            ok = false;
        }
        if (!phone?.value.trim()) {
            show(phoneError, "Phone number is required.");
            ok = false;
        }
        if (!dob?.value) {
            show(dobError, "Date of birth is required.");
            ok = false;
        }
        if (!gender?.value) {
            show(genderError, "Gender is required.");
            ok = false;
        }
        if (!terms?.checked) {
            show(termsError, "You must accept the terms.");
            ok = false;
        }
        if (!ok) return;

        btn.disabled = true;
        if (spinner) spinner.style.display = "inline-block";

        const genderVal = gender.value === "female" ? "FEMALE" : "MALE";

        const payload = {
            name: fullName.value.trim(),
            email: email.value.trim(),
            password: password.value,
            phoneNumber: phone.value.trim(),
            dateOfBirth: dob.value,
            gender: genderVal,
            address: address?.value?.trim() || "",
        };

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                let msg = "Registration failed.";
                try {
                    const err = await res.json();
                    if (err && err.message) msg = err.message;
                } catch {
                    /* ignore */
                }
                show(emailError, msg);
                return;
            }

            window.location.href = "/pages/login.html";
        } catch (err) {
            console.error(err);
            show(emailError, "Network error. Please try again.");
        } finally {
            btn.disabled = false;
            if (spinner) spinner.style.display = "none";
        }
    });

    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();
});
