/* =========================================
   navbar.js – role-aware navbar
========================================= */

let cachedRoleNav = null;

async function loadRoleNavModule() {
    if (!cachedRoleNav) {
        cachedRoleNav = await import("/js/core/role-nav.js");
    }
    return cachedRoleNav;
}

window.initNavbar = async function () {
    const { NAV_BY_ROLE, guestNavItems, renderNavLinksList, profilePathForRole } =
        await loadRoleNavModule();

    const notifTrigger = document.getElementById("notif-trigger");
    const notifPanel = document.getElementById("notifications-panel");
    const markAllReadBtn = document.getElementById("mark-all-read");
    const notifBadge = document.getElementById("notif-badge");

    const profileTrigger = document.getElementById("profile-trigger");
    const profileDropdown = document.getElementById("profile-dropdown");
    const logoutBtn = document.getElementById("logout-btn");

    const guest = document.getElementById("nav-guest");
    const user = document.getElementById("nav-user");
    const navLinks = document.getElementById("nav-links");

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || !role) {
        guest?.removeAttribute("hidden");
        user?.setAttribute("hidden", "");
        renderNavLinksList(navLinks, guestNavItems());
    } else {
        guest?.setAttribute("hidden", "");
        user?.removeAttribute("hidden");

        const items = NAV_BY_ROLE[role];
        if (items) {
            renderNavLinksList(navLinks, items);
        }

        const profileLink = profileDropdown?.querySelector("a[href*='profile']");
        if (profileLink) {
            profileLink.setAttribute("href", profilePathForRole(role));
        }

        try {
            const res = await fetch("/api/user/me", {
                headers: { Authorization: "Bearer " + token },
            });

            if (!res.ok) throw new Error("Unauthorized");

            const data = await res.json();
            const nameEl = document.getElementById("nav-user-name");
            const roleEl = document.getElementById("nav-user-role");
            if (nameEl) nameEl.textContent = data.name || data.email || "User";
            if (roleEl) roleEl.textContent = data.role || role || "";
        } catch (err) {
            console.error("Navbar auth error:", err);
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "/pages/login.html";
            return;
        }
    }

    function closeAll() {
        if (notifPanel) notifPanel.hidden = true;
        if (profileDropdown) profileDropdown.hidden = true;
    }

    notifTrigger?.addEventListener("click", (e) => {
        e.stopPropagation();
        notifPanel.hidden = !notifPanel.hidden;
        if (profileDropdown) profileDropdown.hidden = true;
    });

    profileTrigger?.addEventListener("click", (e) => {
        e.stopPropagation();
        profileDropdown.hidden = !profileDropdown.hidden;
        if (notifPanel) notifPanel.hidden = true;
    });

    markAllReadBtn?.addEventListener("click", () => {
        notifPanel?.querySelectorAll('[data-unread="true"]').forEach((item) => {
            item.removeAttribute("data-unread");
        });
        if (notifBadge) notifBadge.textContent = "0";
    });

    document.addEventListener("click", (e) => {
        if (
            !notifPanel?.contains(e.target) &&
            !notifTrigger?.contains(e.target) &&
            !profileDropdown?.contains(e.target) &&
            !profileTrigger?.contains(e.target)
        ) {
            closeAll();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAll();
    });

    logoutBtn?.addEventListener("click", async (e) => {
        e.preventDefault();
        const { logoutUser } = await import("/js/core/auth.js");
        logoutUser();
    });
};
