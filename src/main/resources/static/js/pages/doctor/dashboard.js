/* ================================================
  dashboard.js  –  Doctor Dashboard (API-backed)
  ================================================ */

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const { bootRoleShell } = await import("/js/core/page-boot.js");
        await bootRoleShell("DOCTOR");
    } catch {
        return;
    }

    const $ = (id) => document.getElementById(id);
    const dateEl = $("greeting-date");
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    const me = await AppointmentService.getCurrentUser();
    const doctors = await AppointmentService.getDoctors();
    const doctor = doctors.find((d) => d.userId === me.id || d.id === me.id);
    if (!doctor) return;

    localStorage.setItem("doctorId", doctor.id);

    const doctorName = doctor.name || "Doctor";
    const greetingName = $("doctor-greeting-name");
    if (greetingName) greetingName.textContent = `Dr. ${doctorName}`;

    const [allAppointments, patientSummaries] = await Promise.all([
        AppointmentService.getDoctorAppointments(doctor.id),
        AppointmentService.getDoctorMyPatients().catch(() => []),
    ]);

    const todayIso = (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    })();
    const todayAppointments = allAppointments.filter((a) => String(a.date) === todayIso);
    const upcomingAppointments = allAppointments.filter((a) => {
        if (!a.date) return false;
        const d = new Date(String(a.date) + "T00:00:00");
        const t = new Date(new Date().toDateString());
        return d > t;
    });

    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekCount = allAppointments.filter((a) => {
        const d = a.date ? new Date(String(a.date) + "T12:00:00") : null;
        return d && d >= new Date(new Date().toDateString()) && d <= weekEnd;
    }).length;

    const pendingToday = todayAppointments.filter((a) => {
        const s = String(a.status || "").toLowerCase();
        return s === "booked" || s === "pending";
    }).length;

    const statToday = $("stat-today-appts");
    const statPatients = $("stat-total-patients");
    const statWeek = $("stat-week-appts");
    const statPending = $("stat-pending-today");
    if (statToday) statToday.textContent = String(todayAppointments.length);
    if (statPatients) statPatients.textContent = String(patientSummaries.length);
    if (statWeek) statWeek.textContent = String(weekCount);
    if (statPending) statPending.textContent = String(pendingToday);

    renderAppointmentTable($("appt-tbody"), todayAppointments, {
        emptyMessage: "No appointments scheduled for today.",
        includeDate: false,
    });
    renderAppointmentTable($("upcoming-appt-tbody"), upcomingAppointments, {
        emptyMessage: "No upcoming appointments found.",
        includeDate: true,
    });

    const ptbody = $("patients-tbody");
    if (ptbody) {
        ptbody.innerHTML = "";
        const rows = (patientSummaries || []).slice(0, 10);
        if (rows.length === 0) {
            ptbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--slate-400)">No patient visits on record yet.</td></tr>`;
        } else {
            rows.forEach((row) => {
                const p = row.patient || {};
                const gender = (p.gender || "—").toString();
                const age = row.age != null ? `${row.age} yrs` : "—";
                const phone = p.phoneNumber || "—";
                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td>
                  <div class="pt-cell">
                    <div class="pt-avatar" style="--hue:${hueFromId(p.id)}"><i class="ph-fill ph-user"></i></div>
                    <div>
                      <div class="pt-name">${esc(p.name || "Patient")}</div>
                      <div class="pt-meta">ID: ${esc(p.id || "—")}</div>
                    </div>
                  </div>
                </td>
                <td>${esc(age)}, ${esc(gender)}</td>
                <td>${esc(phone)}</td>
                <td>${fmt(row.lastVisitDate)}<br><span style="font-size:11.5px;color:var(--slate-400)">${fmtTime(row.lastVisitTime)}</span></td>
                <td>${row.appointmentCount != null ? row.appointmentCount : "—"}</td>
                <td><a href="patient-profile.html?id=${encodeURIComponent(p.id)}" class="btn-view"><i class="ph-bold ph-arrow-right"></i></a></td>`;
                ptbody.appendChild(tr);
            });
        }
    }

    $("patient-search")?.addEventListener("input", function () {
        const q = this.value.toLowerCase().trim();
        $("patients-tbody")?.querySelectorAll("tr").forEach((r) => {
            r.style.display = r.textContent.toLowerCase().includes(q) ? "" : "none";
        });
    });

    const MONTHS = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const today = new Date();
    let cY = today.getFullYear();
    let cM = today.getMonth();
    let sel = today.getDate();

    function pad(n) {
        return String(n).padStart(2, "0");
    }

    function apptDaysForMonth(y, m0) {
        const set = new Set();
        allAppointments.forEach((a) => {
            if (!a.date) return;
            const [yy, mm, dd] = String(a.date).split("-").map(Number);
            if (yy === y && mm === m0 + 1) set.add(dd);
        });
        return set;
    }

    function selectedIso() {
        const maxD = new Date(cY, cM + 1, 0).getDate();
        const day = Math.min(sel, maxD);
        return `${cY}-${pad(cM + 1)}-${pad(day)}`;
    }

    async function loadScheduleSlots() {
        const container = $("schedule-slots");
        const emptyEl = $("schedule-slots-empty");
        if (!container) return;
        const iso = selectedIso();
        const blocks = await AppointmentService.getDoctorMyScheduleForDate(iso).catch(() => []);
        const staticRows = container.querySelectorAll(".session-item");
        staticRows.forEach((el) => el.remove());
        if (!blocks || blocks.length === 0) {
            emptyEl?.removeAttribute("hidden");
            return;
        }
        emptyEl?.setAttribute("hidden", "");
        blocks.forEach((b, i) => {
            const row = document.createElement("div");
            row.className = "session-item";
            row.setAttribute("role", "listitem");
            row.innerHTML = `
            <div class="session-bar ${i % 2 === 0 ? "morning" : "afternoon"}"></div>
            <div class="session-info">
              <span class="session-time">${fmtTime(b.startTime)} – ${fmtTime(b.endTime)}</span>
              <span class="session-name">Scheduled session</span>
            </div>
            <span class="session-badge active">Saved</span>`;
            container.appendChild(row);
        });
    }

    function renderCal() {
        const hdr = $("mini-cal-header");
        const grid = $("mini-cal-days");
        if (!hdr || !grid) return;

        const maxD = new Date(cY, cM + 1, 0).getDate();
        if (sel > maxD) sel = maxD;

        hdr.textContent = `${MONTHS[cM]} ${cY}`;
        grid.innerHTML = "";
        const apptDays = apptDaysForMonth(cY, cM);
        const first = new Date(cY, cM, 1).getDay();
        const total = new Date(cY, cM + 1, 0).getDate();
        const prev = new Date(cY, cM, 0).getDate();
        for (let i = first - 1; i >= 0; i--) {
            grid.appendChild(mk(prev - i, true));
        }
        for (let d = 1; d <= total; d++) {
            const isT = d === today.getDate() && cM === today.getMonth() && cY === today.getFullYear();
            const btn = mk(d, false, isT, d === sel, apptDays.has(d));
            btn.addEventListener("click", () => {
                sel = d;
                renderCal();
            });
            grid.appendChild(btn);
        }
        for (let i = 1; i <= 42 - first - total; i++) {
            grid.appendChild(mk(i, true));
        }
        lbl();
        loadScheduleSlots();
    }

    function mk(n, o = false, isT = false, isS = false, appt = false) {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = n;
        const c = ["cal-day"];
        if (o) c.push("other-m");
        if (isT) c.push("today");
        if (isS && !isT) c.push("selected");
        if (appt) c.push("has-appt");
        b.className = c.join(" ");
        if (o) b.disabled = true;
        return b;
    }

    function lbl() {
        const el = $("schedule-day-label");
        if (!el) return;
        const maxD = new Date(cY, cM + 1, 0).getDate();
        const day = Math.min(sel, maxD);
        el.textContent = new Date(cY, cM, day).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    }

    $("cal-prev")?.addEventListener("click", () => {
        if (cM === 0) {
            cM = 11;
            cY--;
        } else {
            cM--;
        }
        renderCal();
    });
    $("cal-next")?.addEventListener("click", () => {
        if (cM === 11) {
            cM = 0;
            cY++;
        } else {
            cM++;
        }
        renderCal();
    });
    renderCal();

    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();

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
        if (t == null || t === "") return "—";
        const s = String(t);
        const [h, m] = s.split(":").map(Number);
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        return `${h12}:${pad(m || 0)} ${ampm}`;
    }

    function renderAppointmentTable(tbody, appointments, options = {}) {
        if (!tbody) return;
        const includeDate = Boolean(options.includeDate);
        const emptyMessage = options.emptyMessage || "No appointments found.";

        tbody.innerHTML = "";
        if (!appointments || appointments.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--slate-400)">${esc(emptyMessage)}</td></tr>`;
            return;
        }

        appointments
            .slice()
            .sort((a, b) => {
                const da = `${a.date || ""}T${String(a.time || "").slice(0, 8)}`;
                const db = `${b.date || ""}T${String(b.time || "").slice(0, 8)}`;
                return da.localeCompare(db);
            })
            .slice(0, 12)
            .forEach((a) => {
                const statusRaw = String(a.status || "").toLowerCase();
                const statusKey = statusRaw === "booked" || statusRaw === "pending" ? "pending" : statusRaw;
                const tr = document.createElement("tr");
                const timeCell = includeDate
                    ? `<strong>${esc(fmt(a.date))}</strong><br><span style="font-size:11.5px;color:var(--slate-400)">${esc((a.time || "—").toString().substring(0, 5))}</span>`
                    : `<strong>${esc((a.time || "—").toString().substring(0, 5))}</strong>`;
                tr.innerHTML = `
                <td>${timeCell}</td>
                <td>
                    <div class="pt-cell">
                        <div class="pt-avatar" style="--hue:215"><i class="ph-fill ph-user"></i></div>
                        <div>
                            <div class="pt-name">${esc(a.patientName || "Patient")}</div>
                            <div class="pt-meta">ID: ${esc(a.patientId || "—")}</div>
                        </div>
                    </div>
                </td>
                <td>${esc(a.specialty ? `Follow-up · ${a.specialty}` : "Consultation")}</td>
                <td><span class="badge ${statusKey === "confirmed" ? "confirmed" : "pending"}">${cap(statusKey || "pending")}</span></td>
                <td>${
                    statusKey === "confirmed"
                        ? `<a href="start-consultation.html?patient=${encodeURIComponent(a.patientId)}&appointment=${encodeURIComponent(a.id)}" class="btn-start"><i class="ph-bold ph-play"></i> Start Consultation</a>`
                        : `<a href="appointment-details.html?id=${encodeURIComponent(a.id)}" class="btn-view"><i class="ph-bold ph-eye"></i> Details</a>`
                }</td>`;
                tbody.appendChild(tr);
            });
    }

    function esc(s) {
        const div = document.createElement("div");
        div.textContent = s == null ? "" : String(s);
        return div.innerHTML;
    }

    function cap(s) {
        return s ? s.charAt(0).toUpperCase() + s.slice(1) : "Booked";
    }

    function hueFromId(id) {
        const n = Number(id) || 0;
        return 200 + (n % 120);
    }
});
