document.addEventListener("DOMContentLoaded", async () => {
    try {
        const pageBoot = await import("/js/core/page-boot.js");
        await pageBoot.bootRoleShell("PATIENT");
    } catch {
        return;
    }

    const $ = (id) => document.getElementById(id);

    let rows = [];
    try {
        rows = await AppointmentService.getPatientMedicalReports();
    } catch (e) {
        console.error(e);
        rows = [];
    }

    const mapped = (rows || []).map((r) => ({
        appointmentId: r.appointmentId,
        date: r.visitDate || (r.createdAt ? String(r.createdAt).slice(0, 10) : null),
        doctorName: r.doctorName || "—",
        diagnosis: r.diagnosis || r.chiefComplaint || "—",
        status: "Completed",
    }));

    renderSummaryCards(mapped);
    renderTable(mapped);
    setText("stat-total-reports", mapped.length);
    setText(
        "stat-this-year",
        mapped.filter((r) => (r.date || "").startsWith(String(new Date().getFullYear()))).length
    );

    function renderSummaryCards(reports) {
        const grid = $("reports-grid");
        if (!grid) return;
        grid.innerHTML = "";

        reports.slice(0, 3).forEach((report) => {
            const card = document.createElement("article");
            card.className = "card report-card";
            const href = report.appointmentId
                ? `view-report.html?appointment=${encodeURIComponent(report.appointmentId)}`
                : "reports.html";
            card.innerHTML = `
                <h3>${escapeHtml(report.diagnosis)}</h3>
                <p class="report-meta">${formatDate(report.date)} - ${escapeHtml(report.doctorName)}</p>
                <a class="action-link" href="${href}">Open Full Report</a>
            `;
            grid.appendChild(card);
        });
    }

    function renderTable(reports) {
        const tbody = $("reports-body");
        const empty = $("reports-empty");
        if (!tbody) return;
        tbody.innerHTML = "";

        if (!reports.length) {
            empty?.removeAttribute("hidden");
            return;
        }
        empty?.setAttribute("hidden", "");

        reports.forEach((report) => {
            const tr = document.createElement("tr");
            const viewHref = report.appointmentId
                ? `view-report.html?appointment=${encodeURIComponent(report.appointmentId)}`
                : "#";
            tr.innerHTML = `
                <td>${formatDate(report.date)}</td>
                <td>${escapeHtml(report.doctorName)}</td>
                <td>${escapeHtml(report.diagnosis)}</td>
                <td><span class="badge completed">${escapeHtml(report.status)}</span></td>
                <td>
                  <a class="action-link" href="${viewHref}">View Report</a>
                  ${
                      report.appointmentId
                          ? ` · <button type="button" class="action-link btn-pdf" data-appt="${report.appointmentId}" style="background:none;border:none;padding:0;cursor:pointer;font:inherit">PDF</button>`
                          : ""
                  }
                </td>
            `;
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll(".btn-pdf").forEach((btn) => {
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

    function setText(id, value) {
        const el = $(id);
        if (el) el.textContent = String(value);
    }

    function formatDate(iso) {
        if (!iso) return "—";
        const [year, month, day] = iso.split("-").map(Number);
        return new Date(year, month - 1, day).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    function escapeHtml(input) {
        const div = document.createElement("div");
        div.textContent = input;
        return div.innerHTML;
    }

    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();
});
