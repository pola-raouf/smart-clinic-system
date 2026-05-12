/* ================================================
  appointment-details.js  –  Doctor Appointment Details
  ================================================ */

document.addEventListener('DOMContentLoaded', async () => {

    try {
        const { bootRoleShell } = await import('/js/core/page-boot.js');
        await bootRoleShell('DOCTOR');
    } catch {
        return;
    }

    const $ = id => document.getElementById(id);

    /* Read ?id= from URL */
    const params = new URLSearchParams(window.location.search);
    const apptId = params.get('id');
    if (!apptId) {
        window.location.replace('appointments.html');
        return;
    }

    let appointment = null;
    try {
        const me = await AppointmentService.getCurrentUser();
        const doctors = await AppointmentService.getDoctors();
        const doctor = doctors.find(d => d.userId === me.id);
        if (!doctor) throw new Error('Doctor profile not linked.');
        const appts = await AppointmentService.getDoctorAppointments(doctor.id);
        appointment = appts.find(a => String(a.id) === String(apptId));
    } catch (err) {
        console.error(err);
    }

    if (!appointment) {
        window.location.replace('appointments.html');
        return;
    }

    const statusKey = String(appointment.status || '').toLowerCase();
    const a = {
        status: statusKey === 'booked' ? 'pending' : statusKey,
        patient: appointment.patientName || 'Patient',
        ptId: String(appointment.patientId || '—'),
        ptHue: 215,
        age: '—',
        phone: '—',
        email: '—',
        address: '—',
        date: appointment.date,
        time: (appointment.time || '—').substring(0, 5),
        reason: appointment.specialty || 'Consultation',
        booked: `${fmtDate(appointment.date)} — ${(appointment.time || '—').substring(0, 5)}`,
        notes: ''
    };

    /* ── Populate Patient Info ── */
    const ptAv = $('pt-avatar');
    if (ptAv) ptAv.style.cssText = `--hue:${a.ptHue};background:hsl(${a.ptHue},48%,55%)`;
    setText('pt-name',        a.patient);
    setText('pt-id',          `ID: ${a.ptId}`);
    setText('pt-age-gender',  a.age);
    setText('pt-phone',       a.phone);
    setText('pt-email',       a.email);
    setText('pt-address',     a.address);

    /* ── Populate Appointment Info ── */
    setText('appt-id-pill', `ID: ${apptId}`);
    setText('appt-date',    fmtDate(a.date));
    setText('appt-time',    a.time);
    setText('appt-reason',  a.reason);
    setText('appt-booked',  a.booked);

    /* ── Status badge & alert ── */
    const alert  = $('status-alert');
    const icon   = $('status-icon');
    const msgEl  = $('status-message');
    const badge  = $('status-badge');
    const apptBadge = $('appt-status-badge');

    const STATUS_MAP = {
        confirmed: { cls:'confirmed', ico:'ph-check-circle',    msg:'This appointment is <strong>Confirmed</strong> and ready to proceed.', label:'Confirmed'  },
        pending:   { cls:'pending',   ico:'ph-clock',           msg:'This appointment is <strong>Pending</strong> — awaiting confirmation.', label:'Pending'    },
        completed: { cls:'completed', ico:'ph-check-circle',    msg:'This appointment has been <strong>Completed</strong>.',                  label:'Completed'  },
    };

    const sm = STATUS_MAP[a.status] || STATUS_MAP['pending'];
    if (alert)   { alert.className = `status-alert ${sm.cls}`; }
    if (icon)    { icon.className  = `ph-bold ${sm.ico}`; }
    if (msgEl)   { msgEl.innerHTML = sm.msg; }
    if (badge)   { badge.textContent = sm.label; }
    if (apptBadge){ apptBadge.className=`badge ${sm.cls}`; apptBadge.textContent=sm.label; }

    /* ── Notes ── */
    const notesBody = $('notes-body');
    if (notesBody && a.notes) {
        notesBody.innerHTML = `<p class="notes-text">${a.notes}</p>`;
    }

    /* ── Action bar ── */
    const actionMsg  = $('action-msg');
    const actionIcon = $('action-icon');
    const btnStart   = $('btn-start-consult');

    if (a.status === 'confirmed') {
        if (actionMsg)  actionMsg.textContent  = 'This appointment is confirmed. You can start the consultation now.';
        if (actionIcon) actionIcon.className   = 'ph-bold ph-info';
        if (btnStart)   btnStart.href          = `start-consultation.html?patient=${encodeURIComponent(a.ptId)}&appointment=${encodeURIComponent(apptId)}`;
    } else if (a.status === 'pending') {
        if (actionMsg)  actionMsg.textContent  = 'This appointment is pending confirmation. Start Consultation is disabled.';
        if (actionIcon) actionIcon.className   = 'ph-bold ph-warning';
        if (btnStart)   btnStart.setAttribute('disabled','');
    } else {
        if (actionMsg)  actionMsg.textContent  = 'This appointment is completed. Consultation records are available.';
        if (actionIcon) actionIcon.className   = 'ph-bold ph-check-circle';
        if (btnStart) { btnStart.setAttribute('disabled',''); btnStart.innerHTML='<i class="ph-bold ph-check"></i> Completed'; }
    }

    /* ── Hamburger ── */
    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();

    function fmtDate(iso) {
        if (!iso) return '—';
        const [y,m,d] = iso.split('-').map(Number);
        return new Date(y,m-1,d).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
    }

    function setText(id, val) {
        const el = $(id); if (el) el.textContent = val;
    }
});
