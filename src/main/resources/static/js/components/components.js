/* =============================================================
   components.js  –  Injects navbar.html then initialises it
   Include on every page that uses <div id="navbar-container">
   ============================================================= */

async function loadNavbar() {
    const container = document.getElementById("navbar-container");
    if (!container) return;

    try {
        const res = await fetch("/components/navbar.html");
        if (!res.ok) throw new Error("Could not load navbar component");
        container.innerHTML = await res.text();
    } catch (err) {
        console.error("Navbar load error:", err);
        return;
    }

    // Run navbar.js logic (auth, user info, dropdown)
    if (typeof window.initNavbar === "function") {
        await window.initNavbar();
    }

    // Run hamburger toggle after the navbar HTML is in the DOM
    if (typeof window.initSmartClinicNavbar === "function") {
        window.initSmartClinicNavbar();
    }
}

document.addEventListener("DOMContentLoaded", loadNavbar);