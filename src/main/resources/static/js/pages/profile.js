/* ================================================
   profile.js  –  Shared profile pages (all roles)
   ================================================ */

const DATA_ROLE_TO_ENUM = {
    patient: "PATIENT",
    doctor: "DOCTOR",
    owner: "OWNER",
    secretary: "SECRETARY",
};

document.addEventListener("DOMContentLoaded", async () => {
    const auth = await import("/js/core/auth.js");
    const roleNav = await import("/js/core/role-nav.js");

    const expected =
        DATA_ROLE_TO_ENUM[(document.body?.dataset?.role || "").toLowerCase()];
    if (!expected) {
        console.warn("profile.js: missing body[data-role]");
        return;
    }

    try {
        auth.requireAuth();
        auth.requireRole(expected);
    } catch {
        return;
    }

    const $ = (id) => document.getElementById(id);
    let editing = false;

    const editableFields = () =>
        document.querySelectorAll(
            '.form-input:not([id="f-pwd-cur"]):not([id="f-pwd-new"]), .form-select'
        );

    const btnEdit = $("btn-edit");
    btnEdit?.addEventListener("click", () => {
        editing = !editing;
        editableFields().forEach((el) => {
            if (el.tagName === "SELECT") {
                el.disabled = !editing;
            } else {
                el.readOnly = !editing;
            }
            if (editing) el.classList.add("editing");
            else el.classList.remove("editing");
        });
        if (editing) {
            btnEdit.innerHTML =
                '<i class="ph-bold ph-floppy-disk"></i> Save Changes';
            btnEdit.classList.add("editing");
        } else {
            btnEdit.innerHTML =
                '<i class="ph-bold ph-pencil"></i> Edit Profile';
            btnEdit.classList.remove("editing");
            showToast("Profile updated successfully.");
        }
    });

    $("btn-change-pwd")?.addEventListener("click", () => {
        const cur = $("f-pwd-cur");
        const nw = $("f-pwd-new");
        if (!nw || !nw.value.trim()) {
            showToast("Please enter a new password first.");
            return;
        }
        if (nw.value.length < 8) {
            showToast("Password must be at least 8 characters.");
            return;
        }
        if (nw) nw.value = "";
        showToast("Password changed successfully.");
    });

    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();

    function showToast(msg) {
        const t = $("toast");
        const tm = $("toast-msg");
        if (!t) return;
        if (tm) tm.textContent = msg;
        t.classList.add("show");
        setTimeout(() => t.classList.remove("show"), 3000);
    }

    try {
        const res = await fetch("/api/user/me", {
            headers: { Authorization: "Bearer " + auth.getToken() },
        });
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();

        const name = data.name || "";
        const email = data.email || "";
        const roleLabel = data.role || expected;

        const cardName = $("card-name") || document.querySelector(".profile-card h2");
        if (cardName) cardName.textContent = name;

        const badge = document.querySelector(".role-badge");
        if (badge) {
            const short = roleLabel.charAt(0) + roleLabel.slice(1).toLowerCase();
            badge.textContent = short;
        }

        const cardId = $("card-id") || document.querySelector(".profile-card .pid");
        if (cardId) {
            const prefix =
                expected === "PATIENT"
                    ? "P"
                    : expected === "DOCTOR"
                      ? "D"
                      : expected === "OWNER"
                        ? "O"
                        : "S";
            let extra = "";
            if (expected === "DOCTOR" && data.specialty) {
                extra = " · " + data.specialty;
            }
            cardId.textContent = `ID: ${prefix}${String(data.id || "").padStart(4, "0")}${extra}`;
        }

        const setVal = (id, v) => {
            const el = $(id);
            if (el) el.value = v ?? "";
        };

        setVal("f-name", name);
        setVal("f-email", email);
        setVal("f-phone", data.phoneNumber || "");
        setVal("f-address", data.address || "");
        if (data.dateOfBirth) {
            setVal("f-dob", data.dateOfBirth);
        }
        const genderEl = $("f-gender");
        if (genderEl && data.gender) {
            const g = data.gender.toLowerCase();
            genderEl.value = g === "female" ? "female" : "male";
        }

        if (expected === "DOCTOR" && data.specialty != null) {
            const personalSection = document.querySelector(".profile-section");
            const specialtyInput = personalSection?.querySelector(
                ".form-grid .form-group:nth-child(4) .form-input"
            );
            if (specialtyInput) specialtyInput.value = data.specialty;
        }

        const navName = $("nav-name");
        if (navName) navName.textContent = name;

        const ul = document.getElementById("nav-links");
        if (ul && roleNav.NAV_BY_ROLE[expected]) {
            roleNav.renderNavLinksList(ul, roleNav.NAV_BY_ROLE[expected]);
        }
    } catch (e) {
        console.error(e);
        auth.clearAuth();
        window.location.href = "/pages/login.html";
    }
});
