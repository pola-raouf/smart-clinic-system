/* ================================================
   manage-appointments.js  –  Secretary Dashboard
   ================================================ */

document.addEventListener('DOMContentLoaded', async () => {

    try {
        const { bootRoleShell } = await import('/js/core/page-boot.js');
        await bootRoleShell('SECRETARY');
    } catch {
        return;
    }

    /* ─── State ─── */
    let selectedTime   = null;
    let pendingCancelId= null;

    const $ = id => document.getElementById(id);

    /* ─────────────────────────────────────────
       POPULATE DOCTOR DROPDOWN
    ───────────────────────────────────────── */
    const doctorSelect = $('doctor-select');
    AppointmentService.getDoctors().forEach(doc => {
        const opt   = document.createElement('option');
        opt.value   = doc.id;
        opt.textContent = `${doc.name} — ${doc.specialty}`;
        doctorSelect.appendChild(opt);
    });

    /* ─────────────────────────────────────────
       DATE INPUT: set minimum to today
    ───────────────────────────────────────── */
    const dateInput = $('date-input');
    const todayStr  = new Date().toISOString().split('T')[0];
    if (dateInput) dateInput.min = todayStr;

    /* Whenever doctor OR date changes, refresh time slots */
    doctorSelect?.addEventListener('change', renderTimeSlots);
    dateInput?.addEventListener('change',   renderTimeSlots);

    /* ─────────────────────────────────────────
       TIME SLOTS
    ───────────────────────────────────────── */
    function renderTimeSlots() {
        const grid     = $('time-grid');
        if (!grid) return;
        grid.innerHTML = '';
        selectedTime   = null;

        const docId = doctorSelect?.value;
        const date  = dateInput?.value;

        const booked = (docId && date)
            ? AppointmentService.getBookedSlots(docId, date)
            : [];

        AppointmentService.getTimeSlots().forEach(slot => {
            const btn       = document.createElement('button');
            btn.type        = 'button';
            btn.className   = 'time-slot';
            btn.textContent = slot;

            if (booked.includes(slot)) {
                btn.classList.add('booked');
                btn.disabled = true;
            } else {
                btn.addEventListener('click', () => {
                    selectedTime = slot;
                    grid.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    $('err-time').textContent = '';
                });
            }
            grid.appendChild(btn);
        });
    }

    renderTimeSlots();

    /* ─────────────────────────────────────────
       FORM SUBMIT  –  BOOK APPOINTMENT
    ───────────────────────────────────────── */
    const form = $('appt-form');

    form?.addEventListener('submit', (e) => {
        e.preventDefault();

        const patientName = $('patient-name-input')?.value.trim();
        const docId       = doctorSelect?.value;
        const date        = dateInput?.value;

        ['patient','doctor','date','time'].forEach(k => {
            $(`err-${k}`).textContent = '';
        });

        let valid = true;
        if (!patientName) { $('err-patient').textContent = 'Patient name is required.'; valid = false; }
        if (!docId)        { $('err-doctor').textContent  = 'Please select a doctor.';   valid = false; }
        if (!date)         { $('err-date').textContent    = 'Please pick a date.';       valid = false; }
        if (!selectedTime) { $('err-time').textContent    = 'Please select a time slot.'; valid = false; }
        if (!valid) return;

        const doctor = AppointmentService.getDoctorById(docId);

        try {
            AppointmentService.book({
                doctorId:    doctor.id,
                doctorName:  doctor.name,
                specialty:   doctor.specialty,
                patientId:   'sec_' + Date.now(),
                patientName: patientName,
                date:        date,
                time:        selectedTime,
                createdBy:   'secretary',
            });

            showToast('Appointment booked successfully!');
            form.reset();
            selectedTime = null;
            renderTimeSlots();
            renderTable();

        } catch (err) {
            showToast(err.message, true);
        }
    });

    /* ─────────────────────────────────────────
       APPOINTMENTS TABLE
    ───────────────────────────────────────── */
    const tbody      = $('appt-tbody');
    const tableCount = $('table-count');
    const emptyState = $('empty-state');
    const searchInput= $('table-search');
    const statusFilt = $('status-filter');

    function renderTable() {
        const query     = (searchInput?.value || '').toLowerCase().trim();
        const statusVal = statusFilt?.value || '';

        let appointments = AppointmentService.getAll();

        if (query) {
            appointments = appointments.filter(a =>
                a.patientName.toLowerCase().includes(query) ||
                a.doctorName.toLowerCase().includes(query)
            );
        }
        if (statusVal) {
            appointments = appointments.filter(a => a.status === statusVal);
        }

        appointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (!tbody) return;
        tbody.innerHTML = '';

        if (appointments.length === 0) {
            if (emptyState) emptyState.removeAttribute('hidden');
            if (tableCount) tableCount.textContent = '0 appointments';
            return;
        }
        if (emptyState) emptyState.setAttribute('hidden', '');
        if (tableCount) tableCount.textContent = `${appointments.length} appointment${appointments.length !== 1 ? 's' : ''}`;

        appointments.forEach((appt, idx) => {
            const tr          = document.createElement('tr');
            const statusClass = appt.status === 'confirmed' ? 'confirmed' : 'cancelled';
            const createdClass= appt.createdBy === 'secretary' ? 'secretary' : '';

            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td><strong>${escHtml(appt.patientName)}</strong></td>
                <td>${escHtml(appt.doctorName)}</td>
                <td>${escHtml(appt.specialty || '—')}</td>
                <td>${formatDate(appt.date)}</td>
                <td>${escHtml(appt.time)}</td>
                <td><span class="created-by-badge ${createdClass}">${escHtml(appt.createdBy)}</span></td>
                <td><span class="status-badge ${statusClass}">${appt.status}</span></td>
                <td>
                    <button class="btn-cancel-row" data-id="${appt.id}"
                        ${appt.status === 'cancelled' ? 'disabled' : ''}>Cancel</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll('.btn-cancel-row:not(:disabled)').forEach(btn => {
            btn.addEventListener('click', () => {
                pendingCancelId = btn.dataset.id;
                $('cancel-overlay')?.removeAttribute('hidden');
            });
        });
    }

    searchInput?.addEventListener('input', renderTable);
    statusFilt?.addEventListener('change', renderTable);
    renderTable();

    /* ─────────────────────────────────────────
       CANCEL MODAL
    ───────────────────────────────────────── */
    $('cancel-yes')?.addEventListener('click', () => {
        if (!pendingCancelId) return;
        AppointmentService.cancel(pendingCancelId);
        pendingCancelId = null;
        $('cancel-overlay')?.setAttribute('hidden', '');
        renderTable();
        renderTimeSlots();
        showToast('Appointment cancelled.');
    });

    $('cancel-no')?.addEventListener('click', () => {
        pendingCancelId = null;
        $('cancel-overlay')?.setAttribute('hidden', '');
    });

    $('cancel-overlay')?.addEventListener('click', (e) => {
        if (e.target === $('cancel-overlay')) {
            pendingCancelId = null;
            $('cancel-overlay').setAttribute('hidden', '');
        }
    });

    /* ─────────────────────────────────────────
       RESET / HAMBURGER / LOGOUT
    ───────────────────────────────────────── */
    $('btn-reset')?.addEventListener('click', () => {
        selectedTime = null;
        renderTimeSlots();
        ['patient','doctor','date','time'].forEach(k => {
            $(`err-${k}`).textContent = '';
        });
    });

    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();

    $('btn-logout')?.addEventListener('click', async () => {
        const { logoutUser } = await import('/js/core/auth.js');
        logoutUser();
    });

    /* ─────────────────────────────────────────
       HELPERS
    ───────────────────────────────────────── */
    function showToast(msg, isError = false) {
        const toast    = $('toast');
        const toastMsg = $('toast-msg');
        const toastIcon= $('toast-icon');
        if (!toast) return;
        if (toastMsg)  toastMsg.textContent = msg;
        if (toastIcon) toastIcon.className  = isError ? 'ph-bold ph-x-circle' : 'ph-bold ph-check-circle';
        toast.classList.toggle('error', isError);
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('en-US', {
            weekday:'short', year:'numeric', month:'short', day:'numeric'
        });
    }

    function escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }
});
