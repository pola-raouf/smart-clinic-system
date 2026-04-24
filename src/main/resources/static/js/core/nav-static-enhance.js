/**
 * Adds the same profile dropdown + logout pattern as components/navbar.html
 * to static navbars (#main-navbar) that only had ad-hoc logout/name UI.
 */
import { getToken, getRole, logoutUser } from "./auth.js";

function ensureNavbarCss() {
    if (document.querySelector('link[href*="navbar.css"]')) return;
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "/css/navbar.css";
    document.head.appendChild(l);
}

function profileHrefForRole(role) {
    const map = {
        PATIENT: "/pages/patient/profile.html",
        DOCTOR: "/pages/doctor/profile.html",
        OWNER: "/pages/owner/profile.html",
        SECRETARY: "/pages/secretary/profile.html",
    };
    return map[role] || "/pages/login.html";
}

export async function enhanceStaticNavbar() {
    const container = document.querySelector("#main-navbar .nav-container");
    if (!container || document.getElementById("nav-user-injected")) return;

    ensureNavbarCss();

    const token = getToken();
    const role = getRole();
    const profileHref = profileHrefForRole(role);

    const slot = document.createElement("div");
    slot.id = "nav-user-injected";
    slot.style.cssText = "display:contents";

    if (token && role) {
        slot.innerHTML = `
      <div id="nav-user">
        <button type="button" class="profile-trigger" id="static-profile-trigger" aria-expanded="false">
          <img src="/assets/images/doctor.png" class="nav-avatar-img" alt="">
          <div class="nav-user-meta">
            <span id="static-nav-user-name">…</span>
            <span id="static-nav-user-role">${role}</span>
          </div>
        </button>
        <div id="static-profile-dropdown" hidden>
          <a href="${profileHref}">My Profile</a>
          <a href="#" id="static-logout-btn">Logout</a>
        </div>
      </div>`;
    } else {
        slot.innerHTML = `
      <div id="nav-guest">
        <a href="/pages/login.html">Login</a>
        <a href="/pages/register.html">Sign Up</a>
      </div>`;
    }

    const hamburger = container.querySelector("#hamburger-btn");
    if (hamburger) {
        container.insertBefore(slot, hamburger);
    } else {
        container.appendChild(slot);
    }

    container.querySelector(".btn-logout")?.style.setProperty("display", "none");
    container.querySelector(".nav-owner-badge")?.style.setProperty("display", "none");
    container.querySelector(".nav-doctor-info")?.style.setProperty("display", "none");
    container.querySelector("#nav-signup")?.style.setProperty("display", "none");

    const trigger = document.getElementById("static-profile-trigger");
    const dropdown = document.getElementById("static-profile-dropdown");
    const logoutBtn = document.getElementById("static-logout-btn");

    if (token && trigger && dropdown) {
        try {
            const res = await fetch("/api/user/me", {
                headers: { Authorization: "Bearer " + token },
            });
            if (res.ok) {
                const data = await res.json();
                const nameEl = document.getElementById("static-nav-user-name");
                if (nameEl) nameEl.textContent = data.name || data.email || "User";
            }
        } catch {
            /* ignore */
        }

        trigger.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.hidden = !dropdown.hidden;
        });
        document.addEventListener("click", (e) => {
            if (!dropdown?.contains(e.target) && !trigger?.contains(e.target)) {
                if (dropdown) dropdown.hidden = true;
            }
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && dropdown) dropdown.hidden = true;
        });
    }

    logoutBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        logoutUser();
    });
}
