/* ================================================
   patient-profile.js  –  Doctor view, No auth
   ================================================ */

document.addEventListener('DOMContentLoaded', async () => {

    try {
        const { bootRoleShell } = await import('/js/core/page-boot.js');
        await bootRoleShell('DOCTOR');
    } catch {
        return;
    }

    const $ = id => document.getElementById(id);

    /* ── Demo patient data (keyed by ID) ── */
    const PATIENTS = {
        P1001: { name:'Mohamed Hassan', hue:215, age:'45 years',  gender:'Male',   phone:'0123 456 7890', email:'m.hassan@email.com',  dob:'Jan 5, 1981',   address:'Cairo, Egypt',     nextDate:'Wednesday, April 22, 2026 — 09:00 AM', nextDr:'Dr. Ahmed Ali • Cardiology', nextId:'A001' },
        P1002: { name:'Sara Ahmed',     hue:340, age:'32 years',  gender:'Female', phone:'0111 222 3333', email:'sara.ahmed@email.com', dob:'Mar 18, 1994',  address:'Giza, Egypt',      nextDate:'Friday, April 24, 2026 — 10:30 AM',    nextDr:'Dr. Ahmed Ali • Cardiology', nextId:'A002' },
        P1003: { name:'Ahmed Mahmoud',  hue:160, age:'50 years',  gender:'Male',   phone:'0100 555 6666', email:'ahmed.m@email.com',    dob:'Jul 12, 1976',  address:'Alexandria, Egypt',nextDate:'Monday, April 27, 2026 — 02:00 PM',    nextDr:'Dr. Ahmed Ali • Cardiology', nextId:'A003' },
        P1004: { name:'Nour El Din',    hue:280, age:'28 years',  gender:'Female', phone:'0122 333 4444', email:'nourhan@email.com',    dob:'Sep 4, 1998',   address:'Cairo, Egypt',     nextDate:'Tuesday, April 28, 2026 — 11:00 AM',  nextDr:'Dr. Ahmed Ali • Cardiology', nextId:'A004' },
        P1005: { name:'Omar Khaled',    hue:30,  age:'37 years',  gender:'Male',   phone:'0114 567 8901', email:'k.samy@email.com',     dob:'Feb 22, 1989',  address:'Cairo, Egypt',     nextDate:'Thursday, April 30, 2026 — 01:00 PM', nextDr:'Dr. Ahmed Ali • Cardiology', nextId:'A005' },
    };

    /* ── Visit history data (demo, per patient) ── */
    const VISITS = {
        P1001: [
            { date:'Apr 22, 2026', time:'09:00 AM', reason:'Chest Pain',       dr:'Dr. Ahmed Ali', drHue:215, diagnosis:'Hypertension (I10)', apptId:'A001' },
            { date:'Mar 15, 2026', time:'11:00 AM', reason:'Follow-up',        dr:'Dr. Ahmed Ali', drHue:215, diagnosis:'Hypertension (I10)', apptId:'A011' },
            { date:'Feb 10, 2026', time:'10:00 AM', reason:'Regular Checkup',  dr:'Dr. Ahmed Ali', drHue:215, diagnosis:'Stable — No Change',  apptId:'A021' },
            { date:'Jan 5, 2026',  time:'02:30 PM', reason:'Shortness of Breath',dr:'Dr. Ahmed Ali',drHue:215,diagnosis:'Angina Pectoris',    apptId:'A031' },
            { date:'Dec 3, 2025',  time:'09:30 AM', reason:'ECG Review',       dr:'Dr. Ahmed Ali', drHue:215, diagnosis:'Normal Sinus Rhythm', apptId:'A041' },
        ],
        P1002: [
            { date:'Apr 20, 2026', time:'11:00 AM', reason:'Chest Pain',       dr:'Dr. Ahmed Ali', drHue:215, diagnosis:'Pericarditis',        apptId:'A002' },
            { date:'Mar 2, 2026',  time:'03:00 PM', reason:'Follow-up',        dr:'Dr. Ahmed Ali', drHue:215, diagnosis:'Recovered',           apptId:'A012' },
        ],
    };

    /* ── Load patient ── */
    const params = new URLSearchParams(window.location.search);
    const ptId   = params.get('id') || 'P1001';
    const pt     = PATIENTS[ptId] || PATIENTS['P1001'];

    /* Profile top card */
    const avEl = $('profile-avatar');
    if (avEl) avEl.style.cssText = `background:hsl(${pt.hue},48%,55%)`;

    setText('profile-name',    pt.name);
    setText('profile-id',      ptId);
    setText('profile-gender',  pt.gender);
    setText('profile-age',     pt.age);
    setText('profile-phone',   pt.phone);
    setText('profile-email',   pt.email);
    setText('profile-dob',     pt.dob);
    setText('profile-address', pt.address);
    setText('breadcrumb-name', pt.name);

    /* Next appointment */
    setText('next-appt-dt', pt.nextDate);
    setText('next-appt-dr', pt.nextDr);
    const viewApptBtn = document.querySelector('.btn-view-appt');
    if (viewApptBtn) viewApptBtn.href = `appointment-details.html?id=${pt.nextId}`;

    /* ── Visit history table ── */
    const visits  = VISITS[ptId] || [];
    const tbody   = $('visits-tbody');
    const countEl = $('visit-count');

    if (countEl) countEl.textContent = `${visits.length} visit${visits.length !== 1 ? 's' : ''} recorded`;

    if (!tbody) return;
    if (visits.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--slate-400)"><i class="ph-bold ph-calendar-x" style="display:block;font-size:28px;margin-bottom:8px;color:var(--slate-300)"></i>No visit history found for this patient.</td></tr>`;
        return;
    }

    visits.forEach(v => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <strong style="display:block;font-size:13px;color:var(--slate-900)">${v.date}</strong>
                <span style="font-size:11.5px;color:var(--slate-400)">${v.time}</span>
            </td>
            <td>${v.reason}</td>
            <td>
                <div class="doc-cell">
                    <div class="doc-av-sm" style="--hue:${v.drHue};background:hsl(${v.drHue},48%,55%)"><i class="ph-fill ph-user-circle"></i></div>
                    <span style="font-size:13px;font-weight:600;color:var(--slate-800)">${v.dr}</span>
                </div>
            </td>
            <td style="font-size:13px;color:var(--slate-700)">${v.diagnosis}</td>
            <td>
                <a href="appointment-details.html?id=${v.apptId}" class="btn-sm">
                    <i class="ph-bold ph-eye"></i> View Details
                </a>
            </td>`;
        tbody.appendChild(tr);
    });

    /* ── Hamburger ── */
    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();

    function setText(id, val) {
        const el = $(id); if (el) el.textContent = val;
    }
});
