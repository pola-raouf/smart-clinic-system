/* =========================================
   nav-menu.js – HAMBURGER ONLY
========================================= */

(function () {
    function initSmartClinicNavbar() {
        const hamburger = document.getElementById('hamburger-btn');
        const navLinks = document.getElementById('nav-links');

        if (!hamburger || !navLinks) return;

        hamburger.addEventListener('click', () => {
            const open = navLinks.classList.toggle('open');

            hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');

            const icon = hamburger.querySelector('i');
            if (icon) {
                icon.className = open ? 'ph-bold ph-x' : 'ph-bold ph-list';
            }
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');

                const icon = hamburger.querySelector('i');
                if (icon) icon.className = 'ph-bold ph-list';
            });
        });
    }

    window.initSmartClinicNavbar = initSmartClinicNavbar;
})();