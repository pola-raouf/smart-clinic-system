/* ================================================
   appointment-details.js  –  No auth
   ================================================ */

document.addEventListener('DOMContentLoaded', async () => {

    try {
        const { bootRoleShell } = await import('/js/core/page-boot.js');
        await bootRoleShell('DOCTOR');
    } catch {
        return;
    }

    const $ = id => document.getElementById(id);

    /* ── Demo data (keyed by appointment ID) ── */
    const APPTS = {
        A001: { status:'confirmed', patient:'Mohamed Hassan', ptId:'P1001', ptHue:215,
                age:'45 years, Male', phone:'0123 456 7890', email:'m.hassan@email.com', address:'Cairo, Egypt',
                date:'2026-04-22', time:'09:00 AM', reason:'Chest Pain', booked:'Apr 12, 2026 — 02:35 PM', notes:'' },
        A002: { status:'pending',   patient:'Sara Ahmed',     ptId:'P1002', ptHue:340,
                age:'32 years, Female', phone:'0111 222 3333', email:'sara.ahmed@email.com', address:'Giza, Egypt',
                date:'2026-04-22', time:'10:00 AM', reason:'Shortness of Breath', booked:'Apr 13, 2026 — 09:15 AM',
                notes:'Patient mentioned previous episode 2 weeks ago. Bring ECG results.' },
        A003: { status:'completed', patient:'Ahmed Mahmoud',  ptId:'P1003', ptHue:160,
                age:'50 years, Male', phone:'0100 555 6666', email:'ahmed.m@email.com', address:'Alexandria, Egypt',
                date:'2026-04-22', time:'11:00 AM', reason:'Follow-up', booked:'Apr 11, 2026 — 11:45 AM', notes:'' },
        A004: { status:'confirmed', patient:'Nour El Din',    ptId:'P1004', ptHue:280,
                age:'28 years, Female', phone:'0122 333 4444', email:'nourhan@email.com', address:'Cairo, Egypt',
                date:'2026-04-22', time:'12:00 PM', reason:'Heart Palpitations', booked:'Apr 14, 2026 — 03:20 PM', notes:'' },
    };

    /* Read ?id= from URL */
    const params = new URLSearchParams(window.location.search);
    const apptId = params.get('id') || 'A001';
    const a      = APPTS[apptId] || APPTS['A001'];

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
        if (btnStart)   btnStart.href          = `start-consultation.html?patient=${a.ptId}`;
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
