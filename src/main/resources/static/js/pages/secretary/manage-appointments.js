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
    let selectedTime = null;
    let pendingCancelId = null;
    let allAppointments = [];
    let patients = [];
    let linkedPatientHistory = [];

    const $ = id => document.getElementById(id);
    const patientInput = $('patient-name-input');
    const patientSuggestions = $('patient-suggestions');

    /* ─────────────────────────────────────────
       POPULATE DOCTOR DROPDOWN
    ───────────────────────────────────────── */
    const doctorSelect = $('doctor-select');
    let doctors = [];
    try {
        doctors = await AppointmentService.getDoctors();
        doctors.forEach(doc => {
            const opt = document.createElement('option');
            opt.value = doc.id;
            opt.textContent = `${doc.name} — ${doc.specialty}`;
            doctorSelect.appendChild(opt);
        });
    } catch (err) {
        showToast(err.message || 'Failed to load doctors.', true);
    }

    try {
        patients = await AppointmentService.getSecretaryPatients();
        renderPatientSuggestions('');
    } catch (err) {
        showToast(err.message || 'Patients list is unavailable.', true);
    }

    patientInput?.addEventListener('input', (e) => {
        renderPatientSuggestions(e.target.value);
    });

    /* ─────────────────────────────────────────
       DATE INPUT: set minimum to today
    ───────────────────────────────────────── */
    const dateInput = $('date-input');
    const todayStr  = new Date().toISOString().split('T')[0];
    if (dateInput) dateInput.min = todayStr;

    /* Whenever doctor OR date changes, refresh time slots */
    doctorSelect?.addEventListener('change', async () => {
        SecretaryState.setSelectedDoctorId(doctorSelect?.value || null);
        await Promise.all([renderTimeSlots(), refreshDoctorLinkedState()]);
    });
    dateInput?.addEventListener('change',   renderTimeSlots);

    /* ─────────────────────────────────────────
       TIME SLOTS
    ───────────────────────────────────────── */
    async function renderTimeSlots() {
        const grid     = $('time-grid');
        if (!grid) return;
        grid.innerHTML = '';
        selectedTime   = null;

        const docId = doctorSelect?.value;
        const date  = dateInput?.value;
        if (!docId || !date) return;

        let slots = [];
        try {
            slots = await AppointmentService.getDoctorAvailability(docId, date);
        } catch (err) {
            showToast(err.message || 'Failed to load available slots.', true);
            return;
        }

        if (!slots.length) {
            grid.innerHTML = `<p class="text-muted">No available slots for this date.</p>`;
            return;
        }

        slots.forEach(slot => {
            const btn       = document.createElement('button');
            btn.type        = 'button';
            btn.className   = 'time-slot';
            btn.textContent = slot.substring(0, 5);
            btn.addEventListener('click', () => {
                selectedTime = slot;
                grid.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                $('err-time').textContent = '';
            });
            grid.appendChild(btn);
        });
    }

    renderTimeSlots();

    /* ─────────────────────────────────────────
       FORM SUBMIT  –  BOOK APPOINTMENT
    ───────────────────────────────────────── */
    const form = $('appt-form');

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const patientRef  = patientInput?.value.trim();
        const docId       = doctorSelect?.value;
        const date        = dateInput?.value;

        ['patient','doctor','date','time'].forEach(k => {
            $(`err-${k}`).textContent = '';
        });

        let valid = true;
        if (!patientRef)  { $('err-patient').textContent = 'Patient ID or name is required.'; valid = false; }
        if (!docId)        { $('err-doctor').textContent  = 'Please select a doctor.';   valid = false; }
        if (!date)         { $('err-date').textContent    = 'Please pick a date.';       valid = false; }
        if (!selectedTime) { $('err-time').textContent    = 'Please select a time slot.'; valid = false; }
        if (!valid) return;

        const patient = resolvePatient(patientRef);
        if (!patient) {
            $('err-patient').textContent = 'Patient not found. Enter valid ID or exact name.';
            return;
        }

        const dateError = window.ValidationStrategies.dateNotPastStrategy.validate({ date });
        if (dateError) {
            $('err-date').textContent = dateError;
            return;
        }

        try {
            await BookingService.bookAppointment({
                doctorId: Number(docId),
                patientId: Number(patient.id),
                date,
                slotId: selectedTime
            });

            showToast('Appointment booked successfully!');
            form.reset();
            selectedTime = null;
            await Promise.all([renderTimeSlots(), loadAppointments(), refreshDoctorLinkedState()]);

        } catch (err) {
            showToast(err.message || 'Failed to book appointment.', true);
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

        let appointments = [...allAppointments];

        if (query) {
            appointments = appointments.filter(a =>
                (a.patientName || '').toLowerCase().includes(query) ||
                (a.doctorName || '').toLowerCase().includes(query)
            );
        }
        if (statusVal) {
            appointments = appointments.filter(a => toDisplayStatus(a.status).key === statusVal);
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
            const displayStatus = toDisplayStatus(appt.status);
            const normalizedStatus = displayStatus.key;
            const statusClass = normalizedStatus;
            const createdClass= 'secretary';

            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td><strong>${escHtml(appt.patientName)}</strong></td>
                <td>${escHtml(appt.doctorName)}</td>
                <td>${escHtml(appt.specialty || '—')}</td>
                <td>${formatDate(appt.date)}</td>
                <td>${escHtml(appt.time)}</td>
                <td><span class="created-by-badge ${createdClass}">secretary</span></td>
                <td><span class="status-badge ${statusClass}">${escHtml(displayStatus.label)}</span></td>
                <td>
                    <button class="btn-cancel-row btn-confirm-row" data-confirm-id="${appt.id}"
                        ${normalizedStatus === 'pending' ? '' : 'disabled'}>Confirm</button>
                    <button class="btn-cancel-row" data-id="${appt.id}"
                        ${normalizedStatus === 'cancelled' || normalizedStatus === 'completed' ? 'disabled' : ''}>Cancel</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll('.btn-confirm-row:not(:disabled)').forEach(btn => {
            btn.addEventListener('click', async () => {
                try {
                    await AppointmentService.confirm(Number(btn.dataset.confirmId));
                    showToast('Appointment confirmed.');
                    await Promise.all([loadAppointments(), renderTimeSlots(), refreshDoctorLinkedState()]);
                } catch (err) {
                    showToast(err.message || 'Failed to confirm appointment.', true);
                }
            });
        });
        tbody.querySelectorAll('.btn-cancel-row:not(:disabled)').forEach(btn => {
            if (btn.dataset.confirmId) return;
            btn.addEventListener('click', () => {
                pendingCancelId = btn.dataset.id;
                $('cancel-overlay')?.removeAttribute('hidden');
            });
        });
    }

    searchInput?.addEventListener('input', renderTable);
    statusFilt?.addEventListener('change', renderTable);
    loadAppointments();
    refreshDoctorLinkedState();
    SecretaryState.subscribe(async (next) => {
        if (Number(doctorSelect?.value || 0) === Number(next.selectedDoctorId || 0)) return;
        doctorSelect.value = next.selectedDoctorId ? String(next.selectedDoctorId) : "";
        await Promise.all([renderTimeSlots(), refreshDoctorLinkedState()]);
    });

    /* ─────────────────────────────────────────
       CANCEL MODAL
    ───────────────────────────────────────── */
    $('cancel-yes')?.addEventListener('click', async () => {
        if (!pendingCancelId) return;
        try {
            await AppointmentService.cancel(pendingCancelId);
            showToast('Appointment cancelled.');
            await Promise.all([loadAppointments(), renderTimeSlots(), refreshDoctorLinkedState()]);
        } catch (err) {
            showToast(err.message || 'Failed to cancel appointment.', true);
        } finally {
            pendingCancelId = null;
            $('cancel-overlay')?.setAttribute('hidden', '');
        }
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

    function resolvePatient(value) {
        const v = String(value || '').trim();
        if (!v) return null;
        const byCombined = patients.find(p => `${p.id} - ${p.name}`.toLowerCase() === v.toLowerCase());
        if (byCombined) return byCombined;
        const byId = /^\d+$/.test(v) ? patients.find(p => String(p.id) === v) : null;
        if (byId) return byId;
        const exactByName = patients.find(p => String(p.name || '').toLowerCase() === v.toLowerCase());
        if (exactByName) return exactByName;
        const looseByName = patients.filter(p => String(p.name || '').toLowerCase().includes(v.toLowerCase()));
        return looseByName.length === 1 ? looseByName[0] : null;
    }

    function toDisplayStatus(rawStatus) {
        const normalized = String(rawStatus || '').toLowerCase();
        if (normalized === 'booked' || normalized === 'pending') return { key: 'pending', label: 'Pending' };
        if (normalized === 'confirmed') return { key: 'confirmed', label: 'Confirmed' };
        if (normalized === 'cancelled') return { key: 'cancelled', label: 'Cancelled' };
        if (normalized === 'completed') return { key: 'completed', label: 'Completed' };
        return { key: 'pending', label: 'Pending' };
    }

    function renderPatientSuggestions(query) {
        if (!patientSuggestions) return;
        const q = String(query || '').toLowerCase().trim();
        const filtered = !q
            ? patients.slice(0, 50)
            : patients.filter((p) =>
                String(p.name || '').toLowerCase().includes(q) || String(p.id || '').includes(q)
            ).slice(0, 50);
        patientSuggestions.innerHTML = '';
        filtered.forEach((p) => {
            const opt = document.createElement('option');
            opt.value = `${p.id} - ${p.name}`;
            patientSuggestions.appendChild(opt);
        });
    }

    async function refreshDoctorLinkedState() {
        const doctorId = Number(doctorSelect?.value || 0);
        if (!doctorId) {
            linkedPatientHistory = [];
            return;
        }
        try {
            const doctorAppointments = await AppointmentService.getDoctorAppointments(doctorId);
            const patientIds = new Set(doctorAppointments.map(a => Number(a.patientId)).filter(Boolean));
            linkedPatientHistory = patients.filter(p => patientIds.has(Number(p.id)));
            showToast(`Doctor context updated: ${doctorAppointments.length} appointments, ${linkedPatientHistory.length} linked patients.`);
        } catch {
            linkedPatientHistory = [];
        }
    }

    async function loadAppointments() {
        try {
            allAppointments = await AppointmentService.getAllAppointmentsFromDoctors(doctors);
            renderTable();
        } catch (err) {
            showToast(err.message || 'Failed to load appointments.', true);
            allAppointments = [];
            renderTable();
        }
    }
});
