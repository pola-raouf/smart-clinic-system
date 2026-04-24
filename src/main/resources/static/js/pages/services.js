/* ================================================
   services.js  –  Smart Clinic Services Page
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

    const $ = id => document.getElementById(id);

    /* ─────────────────────────────────────────
       1. MOBILE HAMBURGER MENU
    ───────────────────────────────────────── */
    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();

    /* ─────────────────────────────────────────
       2. SERVICE CARD HOVER — animate icon
          (already handled via CSS, but JS can
           add a scroll-in reveal if desired)
    ───────────────────────────────────────── */
    if ('IntersectionObserver' in window) {
        const cards = document.querySelectorAll('.service-card, .feature-card');
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity    = '1';
                    entry.target.style.transform  = 'translateY(0)';
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        cards.forEach(card => {
            card.style.opacity   = '0';
            card.style.transform = 'translateY(24px)';
            card.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
            io.observe(card);
        });
    }

});
