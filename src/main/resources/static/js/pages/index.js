/* ================================================
   index.js  –  Smart Clinic Home Page
   ================================================ */

document.addEventListener('DOMContentLoaded', async () => {

    const $ = id => document.getElementById(id);

    /* ─────────────────────────────────────────
       0. LIVE COUNTS (public API)
    ───────────────────────────────────────── */
    try {
        if (window.AppointmentService?.getPublicClinicSummary) {
            const s = await AppointmentService.getPublicClinicSummary();
            const pEl = $('hero-stat-patients');
            const dEl = $('hero-stat-doctors');
            if (pEl && s.patientLabel) pEl.textContent = s.patientLabel;
            if (dEl && s.doctorLabel) dEl.textContent = s.doctorLabel;
        }
    } catch {
        const pEl = $('hero-stat-patients');
        const dEl = $('hero-stat-doctors');
        if (pEl) pEl.textContent = '—';
        if (dEl) dEl.textContent = '—';
    }

    /* ─────────────────────────────────────────
       1. AUTHENTICATED STATE
    ───────────────────────────────────────── */
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
        const routes = {
            PATIENT: "pages/patient/dashboard.html",
            DOCTOR: "pages/doctor/dashboard.html",
            OWNER: "pages/owner/dashboard.html",
            SECRETARY: "pages/secretary/dashboard.html",
        };
        const dashboardUrl = routes[role] || "index.html";

        const bookBtn = $("hero-book-btn");
        const loginBtn = $("hero-login-btn");

        if (loginBtn) {
            loginBtn.textContent = "Go to Dashboard";
            loginBtn.href = dashboardUrl;
        }

        if (bookBtn) {
            if (role === "PATIENT") {
                bookBtn.href = "pages/patient/book.html";
            } else {
                bookBtn.style.display = "none";
                if (loginBtn) {
                    loginBtn.className = "btn-primary";
                }
            }
        }
    }

    /* ─────────────────────────────────────────
       2. MOBILE HAMBURGER MENU
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
       3. TEASER CARDS (Dynamically fetched)
    ───────────────────────────────────────── */
    const grid = document.getElementById("services-teaser-grid");
    if (grid && window.AppointmentService?.getPublicServices) {
        try {
            const services = await AppointmentService.getPublicServices();
            
            const HUE_MAP = {
                cardiology: 0, dentistry: 200, pediatrics: 160,
                "general-medicine": 220, dermatology: 30, orthopedics: 280,
                ophthalmology: 50, gynecology: 340, default: 215
            };

            grid.innerHTML = "";
            if (!services || services.length === 0) {
                grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--slate-500);">No specialties available yet.</p>`;
            } else {
                // Show up to 8 specialties on the homepage teaser
                services.slice(0, 8).forEach(s => {
                    const specKey = s.specialtyId || s.name.toLowerCase().replace(/\s+/g, '-');
                    const hue = HUE_MAP[specKey] ?? HUE_MAP.default;

                    const card = document.createElement("div");
                    card.className = "teaser-card";
                    card.setAttribute('role', 'button');
                    card.setAttribute('tabindex', '0');
                    card.title = `Go to ${s.name} services`;
                    
                    card.innerHTML = `
                        <div class="teaser-icon" style="--t-hue:${hue}">
                            <i class="ph-bold ph-${s.icon || 'stethoscope'}"></i>
                        </div>
                        <span>${s.name}</span>
                    `;

                    const navigate = () => {
                        window.location.href = `pages/services.html#services-section`;
                    };

                    card.addEventListener('click', navigate);
                    card.addEventListener('keydown', e => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(); }
                    });

                    grid.appendChild(card);
                });
            }
        } catch (err) {
            console.error("Failed to load services teaser:", err);
            grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--slate-500);">Could not load services.</p>`;
        }
    }

});
