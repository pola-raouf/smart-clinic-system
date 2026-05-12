/* ================================================
   patient-profile.js  –  Doctor: patient detail (API)
   ================================================ */

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const { bootRoleShell } = await import("/js/core/page-boot.js");
        await bootRoleShell("DOCTOR");
    } catch {
        return;
    }

    const $ = (id) => document.getElementById(id);
    const params = new URLSearchParams(window.location.search);
    const patientId = Number(params.get("id"));
    if (!patientId) {
        if ($("visits-tbody")) {
            $("visits-tbody").innerHTML =
                `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--slate-400)">Missing patient id in URL.</td></tr>`;
        }
        return;
    }

    let data;
    try {
        data = await AppointmentService.getDoctorPatientProfile(patientId);
    } catch (e) {
        if ($("visits-tbody")) {
            $("visits-tbody").innerHTML =
                `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--slate-400)">${esc(e.message || "Could not load patient.")}</td></tr>`;
        }
        return;
    }

    try {
        const p = data.patient || {};
        const me = await AppointmentService.getCurrentUser();
        const doctors = await AppointmentService.getDoctors();
        const doctor = doctors.find((d) => d.userId === me.id || d.id === me.id);
        const drLabel = doctor ? `Dr. ${doctor.name} · ${doctor.specialty || ""}`.trim() : "—";

        setText("breadcrumb-name", p.name || "Patient");
        setText("profile-name", p.name || "—");
        setText("profile-id", `Patient #${p.id ?? "—"}`);
        setText("profile-gender", p.gender || "—");
        if (p.dateOfBirth) {
            const age = ageFromDob(p.dateOfBirth);
            setText("profile-age", age != null ? `${age} years` : "—");
            setText("profile-dob", fmtDateIso(p.dateOfBirth));
        } else {
            setText("profile-age", "—");
            setText("profile-dob", "—");
        }
        setText("profile-phone", p.phoneNumber || "—");
        setText("profile-email", p.email || "—");
        setText("profile-address", p.address || "—");

        const next = data.nextAppointment;
        const nextCard = document.querySelector(".next-appt-card");
        if (nextCard) {
            if (next && next.date) {
                setText(
                    "next-appt-dt",
                    `${fmtDateIso(next.date)} — ${fmtTime(next.time)}`
                );
                setText("next-appt-dr", drLabel);
                const viewApptBtn = document.querySelector(".btn-view-appt");
                if (viewApptBtn) viewApptBtn.href = `appointment-details.html?id=${encodeURIComponent(next.id)}`;
                nextCard.style.display = "";
            } else {
                nextCard.style.display = "none";
            }
        }

        const records = data.medicalRecords || [];
        const recByAppt = new Map(
            records.filter((r) => r.appointmentId).map((r) => [Number(r.appointmentId), r])
        );

        // Pull prescriptions via the new history endpoint and group by reportId.
        // Falls back gracefully (no prescriptions shown) if the call fails.
        let prescByReport = new Map();
        try {
            const history = await AppointmentService.getDoctorPatientHistory(patientId);
            (history?.prescriptions || []).forEach((px) => {
                const key = Number(px.reportId);
                if (!prescByReport.has(key)) prescByReport.set(key, []);
                prescByReport.get(key).push(px);
            });
        } catch (_) {
            // Non-fatal: keep the table rendering even if history fetch fails.
        }

        const appts = [...(data.appointmentsWithDoctor || [])]
            .filter(a => String(a.status).toUpperCase() === "COMPLETED")
            .sort((a, b) => {
                const da = `${a.date}T${String(a.time || "").slice(0, 8)}`;
                const db = `${b.date}T${String(b.time || "").slice(0, 8)}`;
                return db.localeCompare(da);
            });

        const tbody = $("visits-tbody");
        const countEl = $("visit-count");
        if (countEl) {
            const totalVisits = typeof p.visitCount === "number" ? p.visitCount : null;
            if (totalVisits != null) {
                countEl.textContent = `${totalVisits} completed clinic visit${totalVisits !== 1 ? "s" : ""} · ${appts.length} with you`;
            } else {
                countEl.textContent = `${appts.length} visit${appts.length !== 1 ? "s" : ""} with you`;
            }
        }

        if (!tbody) return;
        tbody.innerHTML = "";
        if (appts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--slate-400)">No visits found with this patient.</td></tr>`;
            return;
        }

        appts.forEach((a) => {
            const r = recByAppt.get(Number(a.id));
            const reason = r?.chiefComplaint || "Consultation / visit";
            const diagnosis = r?.diagnosis || "—";

            // Prescriptions linked to this visit's medical record (if any)
            const meds = r ? (prescByReport.get(Number(r.id)) || []) : [];
            const medsBlock = meds.length
                ? `<ul style="margin:6px 0 0;padding-left:16px;font-size:12px;color:var(--slate-500)">
                       ${meds.map((m) => `<li>${esc(m.medicationName)} — ${esc(m.dosage)} · ${esc(m.frequency)} · ${esc(m.duration)}</li>`).join("")}
                   </ul>`
                : "";

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>
                    <strong style="display:block;font-size:13px;color:var(--slate-900)">${fmtDateIso(a.date)}</strong>
                    <span style="font-size:11.5px;color:var(--slate-400)">${fmtTime(a.time)}</span>
                </td>
                <td>${esc(reason)}</td>
                <td>
                    <div class="doc-cell">
                        <div class="doc-av-sm" style="--hue:215;background:hsl(215,48%,55%)"><i class="ph-fill ph-user-circle"></i></div>
                        <span style="font-size:13px;font-weight:600;color:var(--slate-800)">${esc(drLabel.split("·")[0].trim())}</span>
                    </div>
                </td>
                <td style="font-size:13px;color:var(--slate-700)">
                    ${esc(diagnosis)}
                    ${medsBlock}
                </td>
                <td>
                    <a href="appointment-details.html?id=${encodeURIComponent(a.id)}" class="btn-sm">
                        <i class="ph-bold ph-eye"></i> Details
                    </a>
                </td>`;
            tbody.appendChild(tr);
        });
    } catch (renderError) {
        console.error("Error rendering patient profile:", renderError);
        if ($("visits-tbody")) {
            $("visits-tbody").innerHTML =
                `<tr><td colspan="5" style="text-align:center;padding:32px;color:#f87171">Script error: ${esc(renderError.message)}</td></tr>`;
        }
    }

    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();

    function setText(id, val) {
        const el = $(id);
        if (el) el.textContent = val;
    }

    function fmtDateIso(iso) {
        if (!iso) return "—";
        const [y, m, d] = String(iso).split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    function fmtTime(t) {
        if (t == null || t === "") return "—";
        const s = String(t);
        const [h, m] = s.split(":").map(Number);
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        return `${h12}:${String(m || 0).padStart(2, "0")} ${ampm}`;
    }

    function ageFromDob(dob) {
        if (!dob) return null;
        const [y, m, d] = String(dob).split("-").map(Number);
        const birth = new Date(y, m - 1, d);
        const diff = Date.now() - birth.getTime();
        return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
    }

    function esc(s) {
        const div = document.createElement("div");
        div.textContent = s == null ? "" : String(s);
        return div.innerHTML;
    }
});
