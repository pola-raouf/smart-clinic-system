/* =============================================================
   nav-menu.js  –  Hamburger menu toggle for mobile
   Runs after navbar.html is injected by components.js
   ============================================================= */

(function () {
    function initHamburger() {
        const hamburger = document.getElementById("hamburger-btn");
        const navLinks  = document.getElementById("nav-links");
        if (!hamburger || !navLinks) return;

        hamburger.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("open");
            hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
            const icon = hamburger.querySelector("i");
            if (icon) icon.className = isOpen ? "ph-bold ph-x" : "ph-bold ph-list";
        });

        // Close mobile menu on any nav link click
        navLinks.addEventListener("click", (e) => {
            if (e.target.closest("a")) {
                navLinks.classList.remove("open");
                hamburger.setAttribute("aria-expanded", "false");
                const icon = hamburger.querySelector("i");
                if (icon) icon.className = "ph-bold ph-list";
            }
        });
    }

    window.initSmartClinicNavbar = initHamburger; // keep backward-compat alias
    document.addEventListener("DOMContentLoaded", initHamburger);
})();