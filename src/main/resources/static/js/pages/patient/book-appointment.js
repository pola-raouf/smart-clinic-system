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

    /* ─── Read doctor from URL: ?id=1 ─── */
    const params   = new URLSearchParams(window.location.search);
    const doctorId = params.get('id') || 1;
    const doctor   = AppointmentService.getDoctorById(doctorId)
                  || AppointmentService.getDoctors()[0];

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
    if (avatar)           avatar.style.setProperty('--hue', doctor.hue);
    setText('doc-name',   doctor.name);
    setText('doc-spec',   doctor.specialty);
    setText('doc-exp',    doctor.exp + ' Experience');
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
    function renderTimeSlots() {
        const grid     = $('time-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const booked = selectedDate
            ? AppointmentService.getBookedSlots(doctor.id, selectedDate)
            : [];

        AppointmentService.getTimeSlots().forEach(slot => {
            const btn       = document.createElement('button');
            btn.type        = 'button';
            btn.className   = 'time-slot';
            btn.textContent = slot;

            if (booked.includes(slot)) {
                btn.classList.add('booked');
                btn.disabled = true;
                btn.title    = 'Already booked';
            } else if (slot === selectedTime) {
                btn.classList.add('selected');
            }

            if (!btn.disabled) {
                btn.addEventListener('click', () => onTimeClick(slot));
            }
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
    $('btn-confirm')?.addEventListener('click', () => {
        if (!selectedDate || !selectedTime) return;

        const user = { id: 'guest', name: 'Guest Patient' };

        try {
            const appt = AppointmentService.book({
                doctorId:    doctor.id,
                doctorName:  doctor.name,
                specialty:   doctor.specialty,
                patientId:   user.id,
                patientName: user.name,
                date:        selectedDate,
                time:        selectedTime,
                createdBy:   'patient',
            });

            /* Fill modal */
            setText('modal-doc',  appt.doctorName);
            setText('modal-date', displayDate(appt.date));
            setText('modal-time', appt.time);
            $('modal-overlay')?.removeAttribute('hidden');

            /* Reset selection */
            selectedTime = null;
            renderTimeSlots();
            updateSummary();

        } catch (err) {
            alert('Booking failed: ' + err.message);
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
