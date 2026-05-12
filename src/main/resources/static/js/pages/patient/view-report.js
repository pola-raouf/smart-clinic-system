document.addEventListener("DOMContentLoaded", async () => {
    try {
        const pageBoot = await import("/js/core/page-boot.js");
        await pageBoot.bootRoleShell("PATIENT");
    } catch {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const appointmentId = params.get("appointment");
    if (!appointmentId) {
        document.getElementById("report-root").innerHTML =
            '<p class="err-banner">Missing appointment in URL. Open a report from <a href="reports.html">My Reports</a>.</p>';
        return;
    }

    const root = document.getElementById("report-root");
    try {
        const d = await AppointmentService.getPatientMedicalReportByAppointment(Number(appointmentId));
        const visitLabel = [d.visitDate, d.visitTime].filter(Boolean).join(" · ") || "—";
        const rxRows = (d.prescriptions || [])
            .map(
                (p, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${esc(p.medicationName)}</td>
              <td>${esc(p.dosage)}</td>
              <td>${esc(p.frequency)}</td>
              <td>${esc(p.duration)}</td>
            </tr>`
            )
            .join("");

        root.innerHTML = `
          <div class="report-topbar">
            <div class="report-topbar-left">
              <a href="reports.html" class="btn-back"><i class="ph-bold ph-arrow-left"></i> Back to Reports</a>
              <h1>Medical Report</h1>
              <p>Visit details from your completed appointment.</p>
            </div>
            <div class="report-actions">
              <button type="button" class="btn-print" onclick="window.print()"><i class="ph-bold ph-printer"></i> Print</button>
              <button type="button" class="btn-download" id="btn-download-pdf"><i class="ph-bold ph-file-pdf"></i> Download PDF</button>
            </div>
          </div>

          <div class="report-grid">
            <div class="main-col">
              <div class="report-card">
                <div class="visit-card-body">
                  <div class="doc-identity">
                    <div class="doc-av"><i class="ph-fill ph-user-circle"></i></div>
                    <div class="doc-info">
                      <h3>${esc(d.doctorName || "Doctor")}</h3>
                      <p>${esc(d.specialty || "")}</p>
                      <span class="badge-completed">Visit Completed</span>
                    </div>
                  </div>
                  <div class="visit-meta">
                    <div class="meta-item">
                      <span class="meta-label">Visit</span>
                      <span class="meta-value"><i class="ph-bold ph-calendar-blank"></i> ${esc(visitLabel)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="report-card">
                <div class="card-header"><i class="ph-bold ph-chat-text"></i><h2>Chief complaint</h2></div>
                <div class="card-body"><div class="complaint-box">${esc(d.chiefComplaint)}</div></div>
              </div>

              ${
                  d.symptoms
                      ? `<div class="report-card">
                <div class="card-header"><i class="ph-bold ph-pulse"></i><h2>Symptoms</h2></div>
                <div class="card-body"><div class="complaint-box">${esc(d.symptoms)}</div></div>
              </div>`
                      : ""
              }

              <div class="report-card">
                <div class="card-header"><i class="ph-bold ph-file-medical"></i><h2>Diagnosis &amp; notes</h2></div>
                <div class="card-body">
                  <div class="dx-notes-grid">
                    <div>
                      <p class="mini-label">Diagnosis</p>
                      <div class="dx-box"><div class="dx-name">${esc(d.diagnosis)}</div></div>
                    </div>
                    <div>
                      <p class="mini-label">Doctor's notes</p>
                      <div class="notes-box">${esc(d.notes || "—")}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="report-card">
                <div class="card-header"><i class="ph-bold ph-pill"></i><h2>Prescription</h2></div>
                <div class="table-wrap">
                  <table class="rx-table">
                    <thead><tr><th>#</th><th>Medication</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr></thead>
                    <tbody>${rxRows || `<tr><td colspan="5" style="text-align:center;padding:16px;color:var(--slate-500)">No prescriptions on file.</td></tr>`}</tbody>
                  </table>
                </div>
              </div>
            </div>

            <aside class="panel-col">
              <div class="report-card">
                <div class="card-header"><i class="ph-bold ph-identification-card"></i><h2>Visit summary</h2></div>
                <div class="card-body">
                  <div class="summary-row"><span class="summary-label">Report ID</span><span class="summary-value"><span class="report-id-pill">MR-${esc(String(d.recordId))}</span></span></div>
                  <div class="summary-row"><span class="summary-label">Patient</span><span class="summary-value">${esc(d.patientName)}</span></div>
                </div>
              </div>
            </aside>
          </div>
        `;

        document.getElementById("btn-download-pdf")?.addEventListener("click", async () => {
            try {
                await AppointmentService.downloadReportPdf(Number(appointmentId));
            } catch (e) {
                alert(e.message || "Could not download PDF.");
            }
        });
    } catch (e) {
        root.innerHTML = `<p class="err-banner">${esc(e.message || "Could not load report.")}</p>`;
    }

    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();

    function esc(s) {
        const div = document.createElement("div");
        div.textContent = s == null ? "" : String(s);
        return div.innerHTML;
    }
});
