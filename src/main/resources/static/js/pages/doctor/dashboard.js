/* ================================================
   dashboard.js  –  Doctor Dashboard (no auth)
   ================================================ */

document.addEventListener('DOMContentLoaded', async () => {

    try {
        const { bootRoleShell } = await import('/js/core/page-boot.js');
        await bootRoleShell('DOCTOR');
    } catch {
        return;
    }

    const $ = id => document.getElementById(id);

    /* ── Date display ── */
    const dateEl = $('greeting-date');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

    /* ── Demo data ── */
    const PATIENTS = [
        { id:'P1001', name:'Mohamed Hassan', age:45, gender:'Male',   hue:215, phone:'0123 456 7890', lastVisit:'2026-04-22', reason:'Regular Checkup',     status:'confirmed' },
        { id:'P1002', name:'Sara Ahmed',     age:32, gender:'Female', hue:340, phone:'0111 222 3333', lastVisit:'2026-04-22', reason:'Chest Pain',          status:'confirmed' },
        { id:'P1003', name:'Ahmed Mahmoud',  age:50, gender:'Male',   hue:160, phone:'0100 555 6666', lastVisit:'2026-04-21', reason:'Follow-up',           status:'confirmed' },
        { id:'P1004', name:'Nourhan Ali',    age:28, gender:'Female', hue:280, phone:'0122 333 4444', lastVisit:'2026-04-21', reason:'Shortness of Breath',  status:'pending'   },
        { id:'P1005', name:'Khaled Samy',    age:60, gender:'Male',   hue:30,  phone:'0114 567 8901', lastVisit:'2026-04-20', reason:'Heart Disease',        status:'confirmed' },
        { id:'P1006', name:'Marwan Adel',    age:50, gender:'Male',   hue:50,  phone:'0112 345 6789', lastVisit:'2026-04-20', reason:'ECG Review',           status:'pending'   },
    ];
    const TIMES = ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM'];

    /* ── Appointments Table ── */
    const tbody = $('appt-tbody');
    if (tbody) {
        PATIENTS.forEach((p, i) => {
            const tr = document.createElement('tr');
            const ok = p.status === 'confirmed';
            tr.innerHTML = `
                <td><strong>${TIMES[i]}</strong></td>
                <td>
                    <div class="pt-cell">
                        <div class="pt-avatar" style="--hue:${p.hue}"><i class="ph-fill ph-user"></i></div>
                        <div>
                            <div class="pt-name">${p.name}</div>
                            <div class="pt-meta">${p.age} yrs, ${p.gender} &bull; ID: ${p.id}</div>
                        </div>
                    </div>
                </td>
                <td>${p.reason}</td>
                <td><span class="badge ${p.status}">${ok ? 'Confirmed' : 'Pending'}</span></td>
                <td>${ok
                    ? `<a href="start-consultation.html?patient=${p.id}" class="btn-start"><i class="ph-bold ph-play"></i> Start Consultation</a>`
                    : `<a href="appointment-details.html" class="btn-view"><i class="ph-bold ph-eye"></i> View Details</a>`
                }</td>`;
            tbody.appendChild(tr);
        });
    }

    /* ── Recent Patients Table ── */
    const ptbody = $('patients-tbody');
    if (ptbody) {
        PATIENTS.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><div class="pt-cell"><div class="pt-avatar" style="--hue:${p.hue}"><i class="ph-fill ph-user"></i></div><div class="pt-name">${p.name}</div></div></td>
                <td>${p.age} yrs, ${p.gender}</td>
                <td>${p.phone}</td>
                <td>${fmt(p.lastVisit)}</td>
                <td><i class="ph-bold ph-caret-right" style="color:var(--slate-300)"></i></td>`;
            ptbody.appendChild(tr);
        });
    }

    /* ── Patient Search ── */
    $('patient-search')?.addEventListener('input', function () {
        const q = this.value.toLowerCase().trim();
        $('patients-tbody')?.querySelectorAll('tr').forEach(r => {
            r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
    });

    /* ── Mini Calendar ── */
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const today  = new Date();
    let cY = today.getFullYear(), cM = today.getMonth(), sel = today.getDate();
    const apptDays = new Set([sel, sel+2, sel+4, sel-1].filter(d=>d>0 && d<=31));

    function renderCal() {
        const hdr  = $('mini-cal-header');
        const grid = $('mini-cal-days');
        if (!hdr || !grid) return;
        hdr.textContent = `${MONTHS[cM]} ${cY}`;
        grid.innerHTML  = '';
        const first = new Date(cY,cM,1).getDay();
        const total = new Date(cY,cM+1,0).getDate();
        const prev  = new Date(cY,cM,0).getDate();
        for (let i=first-1;i>=0;i--) { grid.appendChild(mk(prev-i,true)); }
        for (let d=1;d<=total;d++) {
            const isT = d===today.getDate()&&cM===today.getMonth()&&cY===today.getFullYear();
            const isS = d===sel&&cM===today.getMonth();
            const btn = mk(d,false,isT,isS,apptDays.has(d)&&cM===today.getMonth());
            btn.addEventListener('click',()=>{ sel=d; renderCal(); lbl(); });
            grid.appendChild(btn);
        }
        for (let i=1;i<=42-first-total;i++) { grid.appendChild(mk(i,true)); }
        lbl();
    }

    function mk(n,o=false,isT=false,isS=false,appt=false) {
        const b = document.createElement('button');
        b.type='button'; b.textContent=n;
        const c=['cal-day'];
        if(o) c.push('other-m');
        if(isT) c.push('today');
        if(isS&&!isT) c.push('selected');
        if(appt) c.push('has-appt');
        b.className=c.join(' ');
        if(o) b.disabled=true;
        return b;
    }

    function lbl() {
        const el=$('schedule-day-label'); if(!el) return;
        el.textContent = new Date(cY,cM,sel).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
    }

    $('cal-prev')?.addEventListener('click',()=>{ cM===0?(cM=11,cY--):cM--; renderCal(); });
    $('cal-next')?.addEventListener('click',()=>{ cM===11?(cM=0,cY++):cM++; renderCal(); });
    renderCal();

    /* ── Hamburger ── */
    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();

    function fmt(iso) {
        if(!iso) return '—';
        const [y,m,d]=iso.split('-').map(Number);
        return new Date(y,m-1,d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    }
});
