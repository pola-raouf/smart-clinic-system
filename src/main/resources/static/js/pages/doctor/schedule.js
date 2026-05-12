/* ================================================
   schedule.js  –  Doctor Appointment Calendar
   Fetches all appointments and renders a month-view
   calendar with colour-coded status dots.
   ================================================ */

document.addEventListener("DOMContentLoaded", async () => {
    // ── Auth ──
    try {
        const { requireAuth, requireRole } = await import("/js/core/auth.js");
        requireAuth();
        requireRole("DOCTOR");
    } catch { return; }

    // ── Resolve doctor ID (stored after login) ──
    const doctorId = localStorage.getItem("doctorId") || localStorage.getItem("userId");
    if (!doctorId) {
        console.warn("Doctor ID not found in localStorage.");
    }

    // ── State ──
    let allAppointments = [];      // raw API list
    let byDate = {};               // { "2026-04-28": [appt, …] }
    let viewDate = new Date();     // first day of rendered month
    let selectedDate = null;

    // ── DOM refs ──
    const calDays        = document.getElementById("cal-days");
    const calMonthLabel  = document.getElementById("cal-month-label");
    const calPrev        = document.getElementById("cal-prev");
    const calNext        = document.getElementById("cal-next");
    const calToday       = document.getElementById("cal-today");
    const panelDayTitle  = document.getElementById("panel-day-title");
    const dayApptCont    = document.getElementById("day-appt-container");
    const statTotal      = document.getElementById("stat-total");
    const statConfirmed  = document.getElementById("stat-confirmed");
    const statPending    = document.getElementById("stat-pending");
    const statCompleted  = document.getElementById("stat-completed");

    // ── Fetch ──
    async function fetchAppointments() {
        try {
            const token    = localStorage.getItem("token");
            // Resolve real doctor entity ID
            const me       = await AppointmentService.getCurrentUser();
            const doctors  = await AppointmentService.getDoctors();
            const doctor   = doctors.find(d => d.userId === me.id || d.id === me.id);
            if (!doctor) { console.warn("Could not match doctor profile."); return; }

            // Store for re-use
            localStorage.setItem("doctorId", doctor.id);

            const res = await fetch(`/api/appointments/doctor/${doctor.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed");
            allAppointments = await res.json();
        } catch (e) {
            console.error("Failed to load appointments:", e);
            allAppointments = [];
        }
        // Index by date  (API field: date = "YYYY-MM-DD")
        byDate = {};
        allAppointments.forEach(a => {
            const d = a.date ? String(a.date) : null;   // "YYYY-MM-DD"
            if (!d) return;
            if (!byDate[d]) byDate[d] = [];
            byDate[d].push(a);
        });
    }

    // ── Helpers ──
    function pad(n) { return String(n).padStart(2, "0"); }
    function toKey(y, m, d) { return `${y}-${pad(m)}-${pad(d)}`; }

    function statusClass(s) {
        s = (s || "").toLowerCase();
        if (s === "booked")    return "booked";
        if (s === "confirmed") return "confirmed";
        if (s === "completed") return "completed";
        if (s === "cancelled") return "cancelled";
        return "pending";
    }

    function fmt12(timeStr) {
        if (!timeStr) return "";
        const [h, m] = timeStr.split(":").map(Number);
        const ampm = h >= 12 ? "PM" : "AM";
        const h12  = h % 12 || 12;
        return `${h12}:${pad(m)} ${ampm}`;
    }

    // ── Render calendar ──
    function renderCalendar() {
        const year  = viewDate.getFullYear();
        const month = viewDate.getMonth();          // 0-based
        const today = new Date();

        calMonthLabel.textContent = viewDate.toLocaleDateString("en-GB", {
            month: "long", year: "numeric"
        });

        // First day of month, last day
        const firstDay = new Date(year, month, 1);
        const lastDay  = new Date(year, month + 1, 0);

        // Days to show before (from prev month)
        const startPad = firstDay.getDay();          // 0=Sun
        const totalCells = Math.ceil((startPad + lastDay.getDate()) / 7) * 7;

        calDays.innerHTML = "";

        for (let i = 0; i < totalCells; i++) {
            const offset = i - startPad;
            const cellDate = new Date(year, month, 1 + offset);
            const cellDay  = cellDate.getDate();
            const cellMonth= cellDate.getMonth();
            const cellYear = cellDate.getFullYear();
            const key      = toKey(cellYear, cellMonth + 1, cellDay);

            const appts = byDate[key] || [];
            const isToday   = cellDate.toDateString() === today.toDateString();
            const isOther   = cellMonth !== month;
            const isSel     = selectedDate === key;

            const cell = document.createElement("div");
            cell.className = "cal-day" +
                (isOther  ? " other-month" : "") +
                (isToday  ? " today"       : "") +
                (isSel    ? " selected"    : "");
            cell.dataset.key = key;

            // Day number
            const numEl = document.createElement("span");
            numEl.className = "cal-day-num";
            numEl.textContent = cellDay;
            cell.appendChild(numEl);

            // Dots
            if (appts.length > 0 && !isOther) {
                const dotsEl = document.createElement("div");
                dotsEl.className = "cal-dots";
                // Show up to 5 dots
                appts.slice(0, 5).forEach(a => {
                    const d = document.createElement("div");
                    d.className = `cal-dot ${statusClass(a.status)}`;
                    dotsEl.appendChild(d);
                });
                cell.appendChild(dotsEl);
            }

            cell.addEventListener("click", () => {
                selectedDate = key;
                renderCalendar();     // re-render to update selection
                renderDayPanel(key);
            });

            calDays.appendChild(cell);
        }

        // Update monthly stats
        updateStats(year, month);
    }

    function updateStats(year, month) {
        const keys = Object.keys(byDate).filter(k =>
            k.startsWith(`${year}-${pad(month + 1)}`));

        let total = 0, confirmed = 0, pending = 0, completed = 0;
        keys.forEach(k => {
            byDate[k].forEach(a => {
                total++;
                const s = (a.status || "").toLowerCase();
                if (s === "confirmed") confirmed++;
                else if (s === "completed") completed++;
                else if (s === "booked" || s === "pending") pending++;
            });
        });
        if (statTotal)     statTotal.textContent     = total;
        if (statConfirmed) statConfirmed.textContent = confirmed;
        if (statPending)   statPending.textContent   = pending;
        if (statCompleted) statCompleted.textContent = completed;
    }

    function renderDayPanel(key) {
        const appts = byDate[key] || [];
        const label = new Date(key + "T00:00:00").toLocaleDateString("en-GB", {
            weekday: "long", day: "numeric", month: "short", year: "numeric"
        });
        panelDayTitle.textContent = label;

        if (appts.length === 0) {
            dayApptCont.innerHTML = `
                <div class="panel-empty">
                    <i class="ph-bold ph-calendar-x"></i>
                    No appointments on this day
                </div>`;
            return;
        }

        // Sort by time (API field: time = "HH:mm:ss")
        const sorted = [...appts].sort((a, b) =>
            (String(a.time || "")).localeCompare(String(b.time || "")));

        dayApptCont.innerHTML = `
            <div class="day-appt-list">
                ${sorted.map(a => {
                    const sc = statusClass(a.status);
                    const timeStr = a.time ? fmt12(String(a.time)) : "—";
                    return `
                    <div class="day-appt-item ${sc}">
                        <div style="flex:1">
                            <div class="da-time">${timeStr}</div>
                            <div class="da-name">${a.patientName || "Patient"}</div>
                            <div class="da-reason">${a.specialty || ""}</div>
                        </div>
                        <span class="da-badge ${sc}">${(a.status || "").toUpperCase()}</span>
                    </div>`;
                }).join("")}
            </div>`;
    }

    // ── Event listeners ──
    calPrev.addEventListener("click", () => {
        viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
        renderCalendar();
    });
    calNext.addEventListener("click", () => {
        viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
        renderCalendar();
    });
    calToday.addEventListener("click", () => {
        viewDate = new Date();
        viewDate.setDate(1);
        renderCalendar();
    });

    // ── Init ──
    viewDate.setDate(1);
    await fetchAppointments();
    renderCalendar();

    // Auto-select today
    const todayKey = toKey(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
    selectedDate = todayKey;
    renderCalendar();
    renderDayPanel(todayKey);
});
