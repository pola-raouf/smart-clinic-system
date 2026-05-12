/* ================================================
   start-consultation.js  –  Doctor Consultation UI (Dynamic)
   ================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const { requireAuth, requireRole } = await import("/js/core/auth.js");
    requireAuth();
    requireRole("DOCTOR");
  } catch {
    return;
  }

  const $ = (id) => document.getElementById(id);

  /* ──────────────────────────────────────────
       PATIENT DATA (from URL param & API)
    ────────────────────────────────────────── */
  const params = new URLSearchParams(window.location.search);
  const ptId = params.get("patient");
  const apptIdParam = params.get("appointment");

  if (!ptId) {
    showToast("No patient ID provided.", true);
    return;
  }

  try {
    // Fetch Patient Profile
    const profileData = await AppointmentService.fetchData(
      `/api/doctor/me/patient/${ptId}/profile`,
    );
    const pt = profileData.patient || {};
    const age =
      profileData.age != null ? `${profileData.age} years` : "Age unknown";
    const gender = pt.gender || "Unknown gender";

    setText("pt-name", pt.name || "Unknown Patient");
    setText("pt-id", `ID: ${pt.id}`);
    setText("pt-age", `${age}, ${gender}`);
    setText("pt-phone", pt.phoneNumber || "—");
    setText("pt-email", pt.email || "—");
    setText("pt-location", pt.address || "—");

    // Find today's appointment if exists to populate reason
    // We can just set a default for now if not available in profile
    setText("appt-reason", "Consultation");
  } catch (err) {
    console.error("Failed to load patient profile", err);
    showToast("Failed to load patient profile data.", true);
  }

  /* Today's appointment date */
  const dateEl = $("appt-date-line");
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  /* ──────────────────────────────────────────
       MEDICAL HISTORY (from API)
    ────────────────────────────────────────── */
  async function loadMedicalHistory() {
    const historyEl = $("history-content");
    if (!historyEl) return;

    try {
      const history = await AppointmentService.getDoctorPatientHistory(
        Number(ptId),
      );
      const records = history?.diagnoses || [];
      const prescAll = history?.prescriptions || [];

      if (records.length === 0) {
        historyEl.innerHTML =
          '<p style="color: var(--slate-400); text-align: center; padding: 20px;">No completed-visit medical history found for this patient.</p>';
        return;
      }

      let html =
        '<div style="display: flex; flex-direction: column; gap: 1rem;">';
      records
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach((record) => {
          const date = new Date(record.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const meds = prescAll.filter(
            (p) => Number(p.reportId) === Number(record.id),
          );
          const rxHtml = meds.length
            ? `<ul style="margin:8px 0 0;padding-left:18px;font-size:13px;color:var(--slate-600)">
                        ${meds.map((m) => `<li>${escHtml(m.medicationName)} — ${escHtml(m.dosage)} · ${escHtml(m.frequency)} · ${escHtml(m.duration)}</li>`).join("")}
                       </ul>`
            : "";
          html += `
                <div style="border: 1px solid var(--slate-200); border-radius: 8px; padding: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; border-bottom: 1px solid var(--slate-100); padding-bottom: 0.5rem;">
                        <strong>Date: ${date}</strong>
                        <span style="color: var(--slate-500); font-size: 0.9rem;">${escHtml(record.doctorName || "Doctor")}</span>
                    </div>
                    <div style="margin-bottom: 0.5rem;"><strong>Chief complaint:</strong> ${escHtml(record.chiefComplaint || "—")}</div>
                    ${record.symptoms ? `<div style="margin-bottom: 0.5rem;"><strong>Symptoms:</strong> ${escHtml(record.symptoms)}</div>` : ""}
                    <div style="margin-bottom: 0.5rem;"><strong>Diagnosis:</strong> ${escHtml(record.diagnosis || "—")}</div>
                    ${record.notes ? `<div style="margin-bottom: 0.5rem;"><strong>Notes:</strong> ${escHtml(record.notes)}</div>` : ""}
                    ${rxHtml ? `<div><strong>Prescription:</strong>${rxHtml}</div>` : ""}
                </div>`;
        });
      html += "</div>";
      historyEl.innerHTML = html;
    } catch (err) {
      console.error("Failed to load medical history", err);
      historyEl.innerHTML =
        '<p style="color: var(--red-500); text-align: center; padding: 20px;">Failed to load medical history.</p>';
    }
  }

  loadMedicalHistory();

  /* ──────────────────────────────────────────
       CHAR COUNTERS
    ────────────────────────────────────────── */
  document.querySelectorAll("textarea").forEach((ta) => {
    const countEl = document.querySelector(
      `.char-count[data-target="${ta.id}"]`,
    );
    if (!countEl) return;
    const max = parseInt(countEl.dataset.max, 10);
    ta.addEventListener("input", () => {
      countEl.textContent = `${ta.value.length}/${max}`;
    });
  });

  /* ──────────────────────────────────────────
       DIAGNOSIS TAGS
    ────────────────────────────────────────── */
  const tagsWrap = $("diagnosis-tags");
  const diagInput = $("diagnosis-input");

  $("add-diagnosis-btn")?.addEventListener("click", () => {
    const val = diagInput.value.trim();
    if (!val) return;
    addTag(val);
    diagInput.value = "";
    diagInput.focus();
  });

  diagInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      $("add-diagnosis-btn").click();
    }
  });

  function addTag(text) {
    const tag = document.createElement("div");
    tag.className = "diag-tag";
    tag.innerHTML = `
            <span>${escHtml(text)}</span>
            <button type="button" title="Remove" aria-label="Remove ${escHtml(text)}">
                <i class="ph-bold ph-x"></i>
            </button>`;
    tag.querySelector("button").addEventListener("click", () => tag.remove());
    tagsWrap?.appendChild(tag);
  }

  /* ──────────────────────────────────────────
       MEDICATIONS
    ────────────────────────────────────────── */
  const DOSE_OPTS = [
    "5 mg",
    "10 mg",
    "25 mg",
    "50 mg",
    "100 mg",
    "250 mg",
    "500 mg",
    "1000 mg",
  ];
  const FREQ_OPTS = [
    "Once daily",
    "Twice daily",
    "Three times daily",
    "When needed",
    "Every 8 hrs",
    "Every 12 hrs",
  ];
  const DUR_OPTS = [
    "3 days",
    "5 days",
    "7 days",
    "10 days",
    "14 days",
    "30 days",
    "Ongoing",
  ];

  const DEFAULT_MEDS = [
    {
      name: "Amlodipine 5mg Tablet",
      sub: "1 Tablet",
      dose: "5 mg",
      freq: "Once daily",
      dur: "30 days",
    },
    {
      name: "Losartan 50mg Tablet",
      sub: "1 Tablet",
      dose: "50 mg",
      freq: "Once daily",
      dur: "30 days",
    },
    {
      name: "Paracetamol 500mg Tablet",
      sub: "1 Tablet",
      dose: "500 mg",
      freq: "When needed",
      dur: "5 days",
    },
  ];

  const medTbody = $("med-tbody");
  if (medTbody) {
    DEFAULT_MEDS.forEach((m) => addMedRow(m));
  }

  $("add-med-btn")?.addEventListener("click", () => addMedRow());

  function addMedRow(data = {}) {
    if (!medTbody) return;
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>
                <div class="med-name" contenteditable="true" spellcheck="false">${escHtml(data.name || "New Medication")}</div>
                <div class="med-sub">${escHtml(data.sub || "1 Tablet")}</div>
            </td>
            <td>${buildSelect(DOSE_OPTS, data.dose || "10 mg")}</td>
            <td>${buildSelect(FREQ_OPTS, data.freq || "Once daily")}</td>
            <td>${buildSelect(DUR_OPTS, data.dur || "7 days")}</td>
            <td>
                <button class="btn-del-med" title="Remove medication">
                    <i class="ph-bold ph-trash"></i>
                </button>
            </td>
        `;
    tr.querySelector(".btn-del-med").addEventListener("click", () => {
      if (medTbody.rows.length > 1) {
        tr.remove();
      } else {
        showToast("At least one medication is required.", true);
      }
    });
    medTbody?.appendChild(tr);
    if (!data.name) tr.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function buildSelect(options, selected) {
    const opts = options
      .map(
        (o) =>
          `<option value="${o}" ${o === selected ? "selected" : ""}>${o}</option>`,
      )
      .join("");
    return `<select class="med-select">${opts}</select>`;
  }

  $("med-search")?.addEventListener("input", function () {
    const q = this.value.toLowerCase().trim();
    medTbody?.querySelectorAll("tr").forEach((row) => {
      row.style.display = row.textContent.toLowerCase().includes(q)
        ? ""
        : "none";
    });
  });

  /* ──────────────────────────────────────────
       SAVE & FINISH
       1. POST /api/doctor/me/diagnoses        → creates a MedicalRecord row
       2. POST /api/doctor/me/prescriptions    → one per medication row, linked to that record
       3. Redirect to medical-report.html      → which calls GET /api/doctor/me/medical-records
                                                  and shows the new row from the database.
    ────────────────────────────────────────── */
  $("btn-finish")?.addEventListener("click", async () => {
    const btn = $("btn-finish");

    const chief = $("chief-complaint")?.value.trim();
    if (!chief) {
      showToast("Please enter the chief complaint.", true);
      $("chief-complaint")?.focus();
      return;
    }

    // Collect diagnosis tags (entity field is @NotBlank; require at least one)
    const tags = Array.from(tagsWrap?.querySelectorAll(".diag-tag span") || [])
      .map((s) => (s.textContent || "").trim())
      .filter(Boolean);
    if (tags.length === 0) {
      showToast("Please add at least one diagnosis.", true);
      diagInput?.focus();
      return;
    }

    // Collect medication rows from the table
    const meds = collectMedicationRows();

    // Resolve the doctor's id (DTO requires non-null; backend uses JWT email regardless)
    let doctorId = null;
    try {
      const me = await AppointmentService.getCurrentUser();
      const doctors = await AppointmentService.getDoctors();
      const doctor = (doctors || []).find(
        (d) => d.userId === me.id || d.id === me.id,
      );
      doctorId = doctor ? doctor.id : me.id;
    } catch {
      doctorId = 0;
    }

    if (btn) btn.disabled = true;

    try {
      // 1) Save the diagnosis (creates MedicalRecord in `medical_record` table)
      const symptoms = ($("symptoms-field")?.value || "").trim();
      const notesVal = ($("diagnosis-notes")?.value || "").trim();
      const payload = {
        chiefComplaint: chief,
        diagnosis: tags.join(", "),
        notes: notesVal || null,
        doctorId: doctorId,
        patientId: Number(ptId),
      };
      if (symptoms) payload.symptoms = symptoms;
      if (apptIdParam) payload.appointmentId = Number(apptIdParam);

      const record = await AppointmentService.addDiagnosis(payload);

      // 2) Save each medication as a prescription tied to this record
      const results = await Promise.allSettled(
        meds.map((m) =>
          AppointmentService.addPrescription({
            medicationName: m.name,
            dosage: m.dose,
            frequency: m.freq,
            duration: m.dur,
            reportId: record.id,
          }),
        ),
      );
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed > 0) {
        showToast(`Diagnosis saved. ${failed} prescription(s) failed.`, true);
      } else {
        showToast("Consultation saved successfully!");
      }

      // 3) Redirect to medical reports — that page re-fetches from the DB on load,
      //    so the newly created record will appear in the list automatically.
      setTimeout(() => {
        window.location.href = "medical-report.html";
      }, 1200);
    } catch (err) {
      showToast(err?.message || "Failed to save consultation.", true);
      if (btn) btn.disabled = false;
    }
  });

  function collectMedicationRows() {
    if (!medTbody) return [];
    return Array.from(medTbody.rows)
      .map((tr) => {
        const nameEl = tr.querySelector(".med-name");
        const selects = tr.querySelectorAll(".med-select");
        return {
          name: (nameEl?.textContent || "").trim(),
          dose: selects[0]?.value || "",
          freq: selects[1]?.value || "",
          dur: selects[2]?.value || "",
        };
      })
      .filter((m) => m.name && m.dose && m.freq && m.dur);
  }

  $("btn-records")?.addEventListener("click", () => {
    window.location.href = `patient-profile.html?id=${ptId}`;
  });

  /* ──────────────────────────────────────────
       SIDEBAR NAV — active state
    ────────────────────────────────────────── */
  document.querySelectorAll(".snav-item").forEach((item) => {
    item.addEventListener("click", () => {
      document
        .querySelectorAll(".snav-item")
        .forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
    });
  });

  /* ──────────────────────────────────────────
       HELPERS
    ────────────────────────────────────────── */
  function showToast(msg, isError = false) {
    const t = $("toast");
    const msg_ = $("toast-msg");
    const ico = t?.querySelector("i");
    if (!t) return;
    if (msg_) msg_.textContent = msg;
    if (ico) ico.style.color = isError ? "#f87171" : "var(--green-600)";
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
  }

  function setText(id, val) {
    const el = $(id);
    if (el) el.textContent = val;
  }

  function escHtml(str) {
    const el = document.createElement("div");
    el.textContent = str || "";
    return el.innerHTML;
  }
});
