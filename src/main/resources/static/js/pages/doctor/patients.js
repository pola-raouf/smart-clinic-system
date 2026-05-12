/* ================================================
  patients.js  –  Doctor My Patients (API-backed)
  ================================================ */

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const { bootRoleShell } = await import("/js/core/page-boot.js");
        await bootRoleShell("DOCTOR");
    } catch {
        return;
    }

    const $ = (id) => document.getElementById(id);

    let summaries = [];
    try {
        summaries = await AppointmentService.getDoctorMyPatients();
    } catch {
        summaries = [];
    }

    const ALL_ROWS = (summaries || []).map((row) => {
        const p = row.patient || {};
        return {
            id: String(p.id ?? ""),
            name: p.name || `Patient ${p.id ?? ""}`,
            age: row.age != null ? String(row.age) : "—",
            gender: p.gender || "—",
            phone: p.phoneNumber || "—",
            email: p.email || "",
            lastVisit: row.lastVisitDate,
            lastTime: row.lastVisitTime,
            visitCount: row.appointmentCount != null ? String(row.appointmentCount) : "—",
            hue: 200 + (Number(p.id) % 120 || 0),
        };
    });

    const PER_PAGE = 8;
    let currentPage = 1;
    let filtered = [...ALL_ROWS];

    setText("pt-count", ALL_ROWS.length);
    render();

    $("pt-search")?.addEventListener("input", function () {
        const q = this.value.toLowerCase().trim();
        filtered = ALL_ROWS.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.id.toLowerCase().includes(q) ||
                p.phone.toLowerCase().includes(q) ||
                p.email.toLowerCase().includes(q)
        );
        currentPage = 1;
        render();
    });

    $("btn-filter")?.addEventListener("click", () => {
        filtered = [...ALL_ROWS];
        currentPage = 1;
        render();
    });

    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();

    function render() {
        const tbody = $("patients-tbody");
        const pgEl = $("pagination");
        const infoEl = $("show-info");
        if (!tbody) return;

        const total = filtered.length;
        const pages = Math.max(1, Math.ceil(total / PER_PAGE));
        if (currentPage > pages) currentPage = pages;

        const start = (currentPage - 1) * PER_PAGE;
        const slice = filtered.slice(start, start + PER_PAGE);

        tbody.innerHTML = "";
        if (slice.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--slate-400)">No patients found.</td></tr>`;
        } else {
            slice.forEach((p) => {
                const gIco =
                    String(p.gender).toLowerCase() === "male"
                        ? `<i class="ph-bold ph-gender-male gender-male"></i>`
                        : `<i class="ph-bold ph-gender-female gender-female"></i>`;
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><div class="pt-cell">
                        <div class="pt-av" style="--hue:${p.hue}"><i class="ph-fill ph-user"></i></div>
                        <div><div class="pt-name">${esc(p.name)}</div><div class="pt-sub">ID: ${esc(p.id)}</div></div>
                    </div></td>
                    <td><a href="patient-profile.html?id=${encodeURIComponent(p.id)}" class="pt-id-link">${esc(p.id)}</a></td>
                    <td>${esc(p.age)} yrs, ${esc(p.gender)}<br>${gIco}</td>
                    <td>${fmt(p.lastVisit)}<br><span style="font-size:11.5px;color:var(--slate-400)">${fmtTime(p.lastTime)}</span></td>
                    <td><a href="patient-profile.html?id=${encodeURIComponent(p.id)}" class="btn-secondary"><i class="ph-bold ph-eye"></i> View Profile</a></td>`;
                tbody.appendChild(tr);
            });
        }

        if (infoEl) {
            infoEl.textContent =
                total === 0
                    ? "No patients found"
                    : `Showing ${start + 1} to ${Math.min(start + PER_PAGE, total)} of ${total} patients`;
        }

        renderPagination(pgEl, pages);
    }

    function renderPagination(el, pages) {
        if (!el) return;
        el.innerHTML = "";
        const prev = pgBtn('<i class="ph-bold ph-caret-left"></i>');
        prev.disabled = currentPage === 1;
        prev.addEventListener("click", () => {
            currentPage--;
            render();
        });
        el.appendChild(prev);

        pageNums(pages).forEach((p) => {
            const btn = pgBtn(p === "…" ? "…" : p);
            if (p === "…") btn.classList.add("ellipsis");
            else {
                if (p === currentPage) btn.classList.add("active");
                btn.addEventListener("click", () => {
                    currentPage = p;
                    render();
                });
            }
            el.appendChild(btn);
        });

        const next = pgBtn('<i class="ph-bold ph-caret-right"></i>');
        next.disabled = currentPage === pages;
        next.addEventListener("click", () => {
            currentPage++;
            render();
        });
        el.appendChild(next);
    }

    function pgBtn(html) {
        const b = document.createElement("button");
        b.className = "pg-btn";
        b.innerHTML = html;
        return b;
    }

    function pageNums(total) {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        const p = [1];
        if (currentPage > 3) p.push("…");
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(total - 1, currentPage + 1); i++) {
            p.push(i);
        }
        if (currentPage < total - 2) p.push("…");
        p.push(total);
        return p;
    }

    function fmt(iso) {
        if (!iso) return "—";
        const [y, m, d] = String(iso).split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    function fmtTime(t) {
        if (t == null || t === "") return "";
        const s = String(t);
        const [h, m] = s.split(":").map(Number);
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        return `${h12}:${String(m || 0).padStart(2, "0")} ${ampm}`;
    }

    function esc(s) {
        const div = document.createElement("div");
        div.textContent = s == null ? "" : String(s);
        return div.innerHTML;
    }

    function setText(id, val) {
        const el = $(id);
        if (el) el.textContent = val;
    }
});
