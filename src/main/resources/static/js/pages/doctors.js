/* ================================================
   doctors.js  –  Public Doctors Page
   Replaces static cards with real API data
   from GET /api/public/doctors
   ================================================ */

document.addEventListener("DOMContentLoaded", async () => {
    const grid      = document.getElementById("doctors-grid");
    const emptyEl   = document.getElementById("empty-state");
    const searchEl  = document.getElementById("search-input");
    const specEl    = document.getElementById("spec-filter");
    const resetBtn  = document.getElementById("reset-filter");

    const HUE_BY_SPEC = {
        cardiology: 215, dentistry: 200, pediatrics: 160,
        "general medicine": 220, dermatology: 30, orthopedics: 280,
        ophthalmology: 50, gynecology: 340, default: 215
    };

    let allDoctors = [];
    let filtered   = [];

    async function load() {
        grid.innerHTML = `<div class="loading-placeholder"><i class="ph-bold ph-spinner" style="font-size:2rem;animation:spin 1s linear infinite;"></i> Loading doctors…</div>`;
        try {
            allDoctors = await AppointmentService.getPublicDoctors();
        } catch {
            allDoctors = [];
        }
        filtered = [...allDoctors];
        render();
    }

    function render() {
        grid.innerHTML = "";
        if (filtered.length === 0) {
            emptyEl?.removeAttribute("hidden");
            return;
        }
        emptyEl?.setAttribute("hidden", "");

        filtered.forEach((d, i) => {
            const spec   = (d.specialty || "").toLowerCase();
            const hue    = HUE_BY_SPEC[spec] ?? HUE_BY_SPEC.default;
            const initials = getInitials(d.name || "Doctor");
            const photoHtml = d.profileImageUrl
                ? `<img src="${esc(d.profileImageUrl)}" alt="${esc(d.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
                : `<i class="ph-fill ph-user"></i>`;

            const card = document.createElement("article");
            card.className = "doctor-card";
            card.dataset.name = (d.name || "").toLowerCase();
            card.dataset.spec = spec;
            card.innerHTML = `
              <div class="card-photo">
                <div class="doc-avatar" style="--hue:${hue}">${photoHtml}</div>
              </div>
              <div class="card-info">
                <h3 class="doc-name">Dr. ${esc(d.name || "Unknown")}</h3>
                <p class="doc-spec">${esc(d.specialty || "General Practice")}</p>
                <p class="doc-rating">
                  <i class="ph-fill ph-star"></i>
                  4.8 <span>(verified)</span>
                </p>
                <p class="doc-exp">
                  <i class="ph-bold ph-hospital"></i>
                  Smart Clinic, Medical Staff
                </p>
                <div class="card-actions">
                  <a href="patient/book-appointment.html?doctorId=${d.id}" class="btn-book">
                    Book Appointment
                  </a>
                </div>
              </div>`;
            grid.appendChild(card);
        });
    }

    function applyFilters() {
        const q    = (searchEl?.value || "").toLowerCase().trim();
        const spec = (specEl?.value || "").toLowerCase().trim();
        filtered = allDoctors.filter(d => {
            const name     = (d.name || "").toLowerCase();
            const specialty = (d.specialty || "").toLowerCase();
            const matchName = !q    || name.includes(q);
            const matchSpec = !spec || specialty.includes(spec);
            return matchName && matchSpec;
        });
        render();
    }

    searchEl?.addEventListener("input",  applyFilters);
    specEl?.addEventListener("change",   applyFilters);
    resetBtn?.addEventListener("click", () => {
        if (searchEl) searchEl.value = "";
        if (specEl)   specEl.value   = "";
        applyFilters();
    });

    function getInitials(name) {
        const parts = name.trim().split(/\s+/);
        return parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : name.slice(0, 2).toUpperCase();
    }

    function esc(s) {
        const d = document.createElement("div");
        d.textContent = s == null ? "" : String(s);
        return d.innerHTML;
    }

    await load();
});
