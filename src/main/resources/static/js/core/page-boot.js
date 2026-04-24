import { requireAuth, requireRole, getToken, clearAuth } from "./auth.js";
import { NAV_BY_ROLE, renderNavLinksList } from "./role-nav.js";

function applyDisplayName(name) {
    const text = name || "";
    document
        .querySelectorAll("#nav-name, .nav-doctor-name, #sec-username")
        .forEach((el) => {
            el.textContent = text;
        });
    const ownerSpan = document.querySelector(".nav-owner-badge > span");
    if (ownerSpan) ownerSpan.textContent = text;
}

export async function bootRoleShell(role) {
    requireAuth();
    requireRole(role);

    const ul = document.getElementById("nav-links");
    if (ul && NAV_BY_ROLE[role]) {
        renderNavLinksList(ul, NAV_BY_ROLE[role]);
    }

    const res = await fetch("/api/user/me", {
        headers: { Authorization: "Bearer " + getToken() },
    });

    if (!res.ok) {
        clearAuth();
        window.location.replace("/pages/login.html");
        throw new Error("Unauthorized");
    }

    const data = await res.json();
    applyDisplayName(data.name);

    const { enhanceStaticNavbar } = await import("./nav-static-enhance.js");
    await enhanceStaticNavbar();
}
