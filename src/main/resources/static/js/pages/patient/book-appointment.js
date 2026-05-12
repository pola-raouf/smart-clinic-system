/* ================================================
   book-appointment.js  –  Patient Booking Page
   Works from pages/patient/book-appointment.html
   ================================================ */

document.addEventListener('DOMContentLoaded', async () => {

    try {
        const { bootRoleShell } = await import('/js/core/page-boot.js');
        await bootRoleShell('PATIENT');
    } catch {
        return;
    }

    /* ─── Load patient identity for booking linkage ─── */
    let currentPatient = { id: "guest", name: "Guest Patient" };
    try {
        const auth = await import("/js/core/auth.js");
        const res = await fetch("/api/user/me", {
            headers: { Authorization: "Bearer " + auth.getToken() },
        });
        if (res.ok) {
            const me = await res.json();
            currentPatient = {
                id: String(me.id),
                name: me.name || "Patient",
            };
        }
    } catch {
        // Keep fallback guest identity if profile fetch fails.
    }

    /* ─── Read doctor from URL: ?id=1 ─── */
    const params   = new URLSearchParams(window.location.search);
    const doctorId = params.get('id') || 1;
    let doctors = [];
    try {
        doctors = await AppointmentService.getDoctors();
    } catch (err) {
        alert(err.message || "Failed to load doctors.");
        return;
    }
    const doctor = doctors.find(d => d.id === Number(doctorId)) || doctors[0];
    if (!doctor) {
        alert("No doctors are currently available.");
        return;
    }

    /* ─── State ─── */
    let selectedDate = null;   // 'YYYY-MM-DD'
    let selectedTime = null;   // '09:00 AM'

    const today    = new Date();
    let   calYear  = today.getFullYear();
    let   calMonth = today.getMonth();   // 0-based

    /* ─── Convenient $ ─── */
    const $ = id => document.getElementById(id);

    /* ──────────────────────────────────────────
       POPULATE DOCTOR INFO CARD
    ────────────────────────────────────────── */
    const avatar  = $('doc-avatar');
    if (avatar)           avatar.style.setProperty('--hue', doctor.hue || 215);
    setText('doc-name',   doctor.name);
    setText('doc-spec',   doctor.specialty);
    setText('doc-exp',    doctor.exp ? `${doctor.exp} Experience` : 'Specialist');
    setText('sum-name',   doctor.name);
    setText('sum-spec',   doctor.specialty);

    /* ──────────────────────────────────────────
       CALENDAR
    ────────────────────────────────────────── */
    const MONTHS = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];

    function renderCalendar() {
        setText('cal-month-year', `${MONTHS[calMonth]} ${calYear}`);

        const grid        = $('cal-days');
        grid.innerHTML    = '';

        const firstDay    = new Date(calYear, calMonth, 1).getDay();
        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
        const prevTotal   = new Date(calYear, calMonth, 0).getDate();

        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        /* Filler — previous month */
        for (let i = firstDay - 1; i >= 0; i--) {
            grid.appendChild(makeCell(prevTotal - i, ['other-month']));
        }

        /* Current month */
        for (let d = 1; d <= daysInMonth; d++) {
            const thisMidnight = new Date(calYear, calMonth, d);
            const isPast       = thisMidnight < todayMidnight;
            const dateStr      = toISO(calYear, calMonth, d);
            const isSelected   = dateStr === selectedDate;
            const isToday      = d === today.getDate()
                              && calMonth === today.getMonth()
                              && calYear  === today.getFullYear();

            const classes = [];
            if (isPast)               classes.push('disabled');
            if (isSelected)           classes.push('selected');
            if (isToday && !isSelected) classes.push('today');

            const btn = makeCell(d, classes);

            if (!isPast) {
                btn.addEventListener('click', () => onDateClick(dateStr, d));
            }
            grid.appendChild(btn);
        }

        /* Filler — next month (fill to 42 cells for consistent height) */
        const filled = firstDay + daysInMonth;
        for (let i = 1; i <= 42 - filled; i++) {
            grid.appendChild(makeCell(i, ['other-month']));
        }
    }

    function makeCell(num, classes = []) {
        const btn     = document.createElement('button');
        btn.type      = 'button';
        btn.className = ['cal-day', ...classes].join(' ');
        btn.textContent = num;
        return btn;
    }

    function onDateClick(dateStr, dayNum) {
        selectedDate = dateStr;
        selectedTime = null;
        renderCalendar();
        renderTimeSlots();
        updateSummary();

        /* Update time-subtitle label */
        const label = $('selected-date-label');
        if (label) label.textContent = displayDate(dateStr);
    }

    $('prev-month')?.addEventListener('click', () => {
        calMonth === 0 ? (calMonth = 11, calYear--) : calMonth--;
        renderCalendar();
    });

    $('next-month')?.addEventListener('click', () => {
        calMonth === 11 ? (calMonth = 0, calYear++) : calMonth++;
        renderCalendar();
    });

    /* ──────────────────────────────────────────
       TIME SLOTS
    ────────────────────────────────────────── */
    async function renderTimeSlots() {
        const grid     = $('time-grid');
        if (!grid) return;
        grid.innerHTML = '';

        if (!selectedDate) {
            grid.innerHTML = '<p class="text-muted">Please select a date first.</p>';
            return;
        }

        grid.innerHTML = '<div style="text-align: center; padding: 1rem; grid-column: 1 / -1;"><i class="ph-bold ph-spinner ph-spin"></i> Loading slots...</div>';

        let availableSlots = [];
        try {
            availableSlots = await AppointmentService.getDoctorAvailability(doctor.id, selectedDate);
        } catch (err) {
            console.error("Failed to fetch slots", err);
            grid.innerHTML = '<div style="color: red; text-align: center; grid-column: 1 / -1;">Failed to load available slots</div>';
            return;
        }

        grid.innerHTML = '';
        if (availableSlots.length === 0) {
            grid.innerHTML = '<p class="text-muted" style="grid-column: 1 / -1; text-align: center;">No available slots for this date.</p>';
            return;
        }

        // Format to standard AM/PM for display if needed, but the backend returns e.g. "09:30:00"
        availableSlots.forEach(slot => {
            const btn       = document.createElement('button');
            btn.type        = 'button';
            btn.className   = 'time-slot';
            btn.textContent = slot.substring(0, 5); // display "HH:MM"

            if (slot === selectedTime) {
                btn.classList.add('selected');
            }

            btn.addEventListener('click', () => onTimeClick(slot));
            grid.appendChild(btn);
        });
    }

    function onTimeClick(slot) {
        selectedTime = slot;
        renderTimeSlots();
        updateSummary();
    }

    /* ──────────────────────────────────────────
       SUMMARY
    ────────────────────────────────────────── */
    function updateSummary() {
        setText('sum-date', selectedDate ? displayDate(selectedDate) : 'Not selected');
        setText('sum-time', selectedTime || 'Not selected');

        const btn = $('btn-confirm');
        if (btn) btn.disabled = !(selectedDate && selectedTime);
    }

    /* ──────────────────────────────────────────
       CONFIRM BOOKING
    ────────────────────────────────────────── */
    $('btn-confirm')?.addEventListener('click', async () => {
        if (!selectedDate || !selectedTime) return;

        const btn = $('btn-confirm');
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i class="ph-bold ph-spinner ph-spin"></i> Booking...`;
        btn.disabled = true;

        try {
            const appt = await AppointmentService.book({
                doctorId:    doctor.id,
                patientId:   currentPatient.id,
                date:        selectedDate,
                time:        selectedTime
            });

            /* Fill modal */
            setText('modal-doc',  doctor.name);
            setText('modal-date', displayDate(appt.date));
            setText('modal-time', appt.time.substring(0, 5));
            $('modal-overlay')?.removeAttribute('hidden');

            /* Reset selection */
            selectedTime = null;
            await renderTimeSlots();
            updateSummary();

        } catch (err) {
            alert('Booking failed: ' + err.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });

    /* Modal close */
    $('modal-close')?.addEventListener('click', closeModal);
    $('modal-overlay')?.addEventListener('click', (e) => {
        if (e.target === $('modal-overlay')) closeModal();
    });

    function closeModal() {
        $('modal-overlay')?.setAttribute('hidden', '');
    }

    /* ──────────────────────────────────────────
       HAMBURGER
    ────────────────────────────────────────── */
    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();

    /* ──────────────────────────────────────────
       HELPERS
    ────────────────────────────────────────── */

    /** 'YYYY-MM-DD' → 'Thursday, May 15, 2025' */
    function displayDate(iso) {
        const [y, m, d] = iso.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    /** Build 'YYYY-MM-DD' from 0-based calMonth */
    function toISO(y, m, d) {
        return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    }

    function setText(id, val) {
        const el = $(id);
        if (el) el.textContent = val;
    }

    /* ──────────────────────────────────────────
       INIT
    ────────────────────────────────────────── */
    renderCalendar();
    renderTimeSlots();
    updateSummary();
});
