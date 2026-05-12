/* ================================================
   services.js  –  Public Services Page
   Fetches dynamic services from /api/public/services
   ================================================ */

document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.getElementById("services-grid");
    if (!grid) return;

    const HUE_MAP = {
        cardiology: 0, dentistry: 200, pediatrics: 160,
        "general-medicine": 220, dermatology: 30, orthopedics: 280,
        ophthalmology: 50, gynecology: 340, default: 215
    };

    grid.innerHTML = `<div class="loading-placeholder"><i class="ph-bold ph-spinner" style="font-size:2rem;animation:spin 1s linear infinite;"></i> Loading services…</div>`;

    try {
        const services = await AppointmentService.getPublicServices();
        
        grid.innerHTML = "";
        if (!services || services.length === 0) {
            grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--slate-500);">No services currently available.</p>`;
            return;
        }

        services.forEach(s => {
            const specKey = s.specialtyId || s.name.toLowerCase().replace(/\s+/g, '-');
            const hue = HUE_MAP[specKey] ?? HUE_MAP.default;

            const card = document.createElement("div");
            card.className = "service-card";
            card.innerHTML = `
                <div class="service-icon" style="--svc-hue:${hue}">
                    <i class="ph-bold ph-${esc(s.icon || 'stethoscope')}"></i>
                </div>
                <h3>${esc(s.name)}</h3>
                <p>${esc(s.description)}</p>
                <a href="doctors.html?spec=${encodeURIComponent(specKey)}" class="btn-view">
                    View Doctors <i class="ph-bold ph-arrow-right"></i>
                </a>
            `;
            grid.appendChild(card);
        });

    } catch (err) {
        grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--red-600);">Could not load services.</p>`;
    }

    function esc(s) {
        const div = document.createElement("div");
        div.textContent = s == null ? "" : String(s);
        return div.innerHTML;
    }
});
