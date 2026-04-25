/* ================================================
   medical-report.js – Doctor reports list
   ================================================ */

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const { bootRoleShell } = await import("/js/core/page-boot.js");
        await bootRoleShell("DOCTOR");
    } catch {
        return;
    }

    const $ = (id) => document.getElementById(id);

    const REPORTS = [
        { id: "MR-2026-001", patientId: "P1001", patient: "Mohamed Hassan", date: "2026-04-22", diagnosis: "Hypertension (I10)", status: "Final" },
        { id: "MR-2026-002", patientId: "P1002", patient: "Sara Ahmed", date: "2026-04-20", diagnosis: "Pericarditis", status: "Needs Follow-up" },
        { id: "MR-2026-003", patientId: "P1003", patient: "Ahmed Mahmoud", date: "2026-04-18", diagnosis: "Stable angina", status: "Final" },
        { id: "MR-2026-004", patientId: "P1004", patient: "Nour El Din", date: "2026-04-16", diagnosis: "Palpitations - observation", status: "Pending" },
        { id: "MR-2026-005", patientId: "P1005", patient: "Omar Khaled", date: "2026-04-15", diagnosis: "High blood pressure", status: "Final" },
        { id: "MR-2026-006", patientId: "P1006", patient: "Heba Mostafa", date: "2026-04-14", diagnosis: "ECG review required", status: "Needs Follow-up" },
        { id: "MR-2026-007", patientId: "P1007", patient: "Youssef Ali", date: "2026-04-12", diagnosis: "Routine cardiovascular check", status: "Final" },
        { id: "MR-2026-008", patientId: "P1008", patient: "Manar Tarek", date: "2026-04-11", diagnosis: "Dizziness / fatigue", status: "Pending" }
    ];

    let filtered = [...REPORTS];

    $("report-search")?.addEventListener("input", filterReports);
    $("report-status")?.addEventListener("change", filterReports);
    $("clear-report-filters")?.addEventListener("click", () => {
        if ($("report-search")) $("report-search").value = "";
        if ($("report-status")) $("report-status").value = "";
        filterReports();
    });
    $("btn-export-reports")?.addEventListener("click", () => {
        alert("Export will be connected to backend export endpoint.");
    });

    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();
    render();

    function filterReports() {
        const q = ($("report-search")?.value || "").toLowerCase().trim();
        const status = $("report-status")?.value || "";
        filtered = REPORTS.filter((r) => {
            const matchesText =
                r.id.toLowerCase().includes(q) ||
                r.patient.toLowerCase().includes(q) ||
                r.patientId.toLowerCase().includes(q) ||
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
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--slate-400)">No reports found.</td></tr>`;
            setText("report-count", 0);
            return;
        }
        filtered.forEach((r) => {
            const tr = document.createElement("tr");
            const statusClass =
                r.status === "Final" ? "status-confirmed" :
                r.status === "Pending" ? "status-pending" : "status-completed";
            tr.innerHTML = `
                <td><strong>${r.id}</strong></td>
                <td>
                  <div class="pt-cell">
                    <div class="pt-av" style="--hue:215"><i class="ph-fill ph-user"></i></div>
                    <div>
                      <div class="pt-name">${r.patient}</div>
                      <div class="pt-sub">ID: ${r.patientId}</div>
                    </div>
                  </div>
                </td>
                <td>${formatDate(r.date)}</td>
                <td>${r.diagnosis}</td>
                <td><span class="status-chip ${statusClass}">${r.status}</span></td>
                <td>
                  <a href="patient-profile.html?id=${r.patientId}" class="btn-secondary">
                    <i class="ph-bold ph-eye"></i> View Patient
                  </a>
                </td>
            `;
            tbody.appendChild(tr);
        });
        setText("report-count", filtered.length);
    }

    function formatDate(iso) {
        const [y, m, d] = iso.split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }

    function setText(id, value) {
        const el = $(id);
        if (el) el.textContent = value;
    }
});
