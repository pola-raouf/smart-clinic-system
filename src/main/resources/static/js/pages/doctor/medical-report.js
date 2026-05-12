/* ================================================
   medical-report.js – Doctor medical records (API)
   ================================================ */

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const { bootRoleShell } = await import("/js/core/page-boot.js");
        await bootRoleShell("DOCTOR");
    } catch {
        return;
    }

    const $ = (id) => document.getElementById(id);

    let allRows = [];
    try {
        const raw = await AppointmentService.getDoctorMedicalRecords();
        allRows = (raw || []).map((r) => ({
            id: r.id,
            appointmentId: r.appointmentId,
            patientId: r.patientId,
            patient: r.patientName || `Patient ${r.patientId}`,
            date: r.visitDate || (r.createdAt ? String(r.createdAt).slice(0, 10) : "—"),
            diagnosis: r.diagnosis || r.chiefComplaint || "—",
            status: r.diagnosis && String(r.diagnosis).trim() ? "Final" : "Pending",
        }));
    } catch {
        allRows = [];
    }

    let filtered = [...allRows];

    $("report-search")?.addEventListener("input", filterReports);
    $("report-status")?.addEventListener("change", filterReports);
    $("clear-report-filters")?.addEventListener("click", () => {
        if ($("report-search")) $("report-search").value = "";
        if ($("report-status")) $("report-status").value = "";
        filterReports();
    });
    $("btn-export-reports")?.addEventListener("click", () => {
        window.print();
    });

    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();
    render();

    function filterReports() {
        const q = ($("report-search")?.value || "").toLowerCase().trim();
        const status = $("report-status")?.value || "";
        filtered = allRows.filter((r) => {
            const matchesText =
                String(r.id).includes(q) ||
                r.patient.toLowerCase().includes(q) ||
                String(r.patientId).includes(q) ||
                r.diagnosis.toLowerCase().includes(q);
            const matchesStatus = !status || r.status === status;
            return matchesText && matchesStatus;
        });
        render();
    }

    function render() {
        const tbody = $("report-tbody");
        if (!tbody) return;
        tbody.innerHTML = "";
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:28px;color:var(--slate-400)">No reports found.</td></tr>`;
            setText("report-count", 0);
            return;
        }
        filtered.forEach((r) => {
            const tr = document.createElement("tr");
            const statusClass =
                r.status === "Final"
                    ? "status-confirmed"
                    : r.status === "Pending"
                      ? "status-pending"
                      : "status-completed";
            tr.innerHTML = `
                <td><strong>MR-${r.id}</strong></td>
                <td>
                  <div class="pt-cell">
                    <div class="pt-av" style="--hue:215"><i class="ph-fill ph-user"></i></div>
                    <div>
                      <div class="pt-name">${esc(r.patient)}</div>
                      <div class="pt-sub">ID: ${esc(r.patientId)}</div>
                    </div>
                  </div>
                </td>
                <td>${formatDate(r.date)}</td>
                <td>${esc(r.diagnosis)}</td>
                <td><span class="status-chip ${statusClass}">${esc(r.status)}</span></td>
                <td>
                  ${
                      r.appointmentId
                          ? `<button type="button" class="btn-secondary btn-pdf-row" data-appt="${encodeURIComponent(r.appointmentId)}"><i class="ph-bold ph-file-pdf"></i> PDF</button>`
                          : `<span style="color:var(--slate-400);font-size:12px">—</span>`
                  }
                </td>
                <td>
                  <a href="patient-profile.html?id=${encodeURIComponent(r.patientId)}" class="btn-secondary">
                    <i class="ph-bold ph-eye"></i> View Patient
                  </a>
                </td>
            `;
            tbody.appendChild(tr);
        });
        setText("report-count", filtered.length);

        tbody.querySelectorAll(".btn-pdf-row").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-appt");
                if (!id) return;
                try {
                    await AppointmentService.downloadReportPdf(Number(id));
                } catch (e) {
                    alert(e.message || "Could not download PDF.");
                }
            });
        });
    }

    function formatDate(iso) {
        if (!iso || iso === "—") return "—";
        const [y, m, d] = iso.split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    function setText(id, value) {
        const el = $(id);
        if (el) el.textContent = value;
    }

    function esc(s) {
        const d = document.createElement("div");
        d.textContent = s == null ? "" : String(s);
        return d.innerHTML;
    }
});
