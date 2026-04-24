/* ================================================
   index.js  –  Smart Clinic Home Page
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

    const $ = id => document.getElementById(id);

    /* ─────────────────────────────────────────
       1. MOBILE HAMBURGER MENU
    ───────────────────────────────────────── */
    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();

    /* ─────────────────────────────────────────
       2. SCROLL-REVEAL for feature & teaser cards
    ───────────────────────────────────────── */
    if ('IntersectionObserver' in window) {
        const targets = document.querySelectorAll(
            '.feature-item, .teaser-card, .cta-inner'
        );

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    entry.target.style.transitionDelay = `${i * 40}ms`;
                    entry.target.style.opacity   = '1';
                    entry.target.style.transform = 'translateY(0)';
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.10 });

        targets.forEach(el => {
            el.style.opacity   = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            io.observe(el);
        });
    }

    /* ─────────────────────────────────────────
       3. TEASER CARDS  →  navigate to services
          with specialty pre-selected
    ───────────────────────────────────────── */
    const specMap = {
        'Cardiology':       'cardiologist',
        'Dentistry':        'dentist',
        'Pediatrics':       'pediatrician',
        'General Medicine': 'general-physician',
        'Dermatology':      'dermatologist',
        'Orthopedics':      'orthopedic-surgeon',
        'Ophthalmology':    'ophthalmologist',
        'Gynecology':       'gynecologist',
    };

    document.querySelectorAll('.teaser-card').forEach(card => {
        const label = card.querySelector('span')?.textContent?.trim();
        if (label) {
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.title = `Go to ${label} services`;

            const navigate = () => {
                const spec = specMap[label];
                const url  = spec
                    ? `services.html#services-section`
                    : 'services.html';
                window.location.href = url;
            };

            card.addEventListener('click', navigate);
            card.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(); }
            });
        }
    });

});
