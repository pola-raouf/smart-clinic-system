/* ================================================
   appointments.js  –  Doctor Appointments (no auth)
   ================================================ */

document.addEventListener('DOMContentLoaded', async () => {

    try {
        const { bootRoleShell } = await import('/js/core/page-boot.js');
        await bootRoleShell('DOCTOR');
    } catch {
        return;
    }

    const $ = id => document.getElementById(id);

    /* ── Demo data (8 appointments) ── */
    const ALL_APPTS = [
        { id:'A001', time:'09:00 AM', date:'2026-04-22', patient:'Mohamed Hassan', ptId:'P1001', hue:215, reason:'Chest Pain',          status:'confirmed', bookedDate:'2026-04-12', bookedTime:'02:35 PM' },
        { id:'A002', time:'10:00 AM', date:'2026-04-22', patient:'Sara Ahmed',     ptId:'P1002', hue:340, reason:'Shortness of Breath', status:'pending',   bookedDate:'2026-04-13', bookedTime:'09:15 AM' },
        { id:'A003', time:'11:00 AM', date:'2026-04-22', patient:'Ahmed Mahmoud',  ptId:'P1003', hue:160, reason:'Follow-up',           status:'completed', bookedDate:'2026-04-11', bookedTime:'11:45 AM' },
        { id:'A004', time:'12:00 PM', date:'2026-04-22', patient:'Nour El Din',    ptId:'P1004', hue:280, reason:'Heart Palpitations',  status:'confirmed', bookedDate:'2026-04-14', bookedTime:'03:20 PM' },
        { id:'A005', time:'01:00 PM', date:'2026-04-22', patient:'Omar Khaled',    ptId:'P1005', hue:30,  reason:'High Blood Pressure', status:'pending',   bookedDate:'2026-04-15', bookedTime:'10:05 AM' },
        { id:'A006', time:'02:30 PM', date:'2026-04-22', patient:'Manar Tarek',    ptId:'P1006', hue:50,  reason:'Dizziness',           status:'confirmed', bookedDate:'2026-04-15', bookedTime:'04:30 PM' },
        { id:'A007', time:'04:00 PM', date:'2026-04-22', patient:'Youssef Ali',    ptId:'P1007', hue:190, reason:'Routine Checkup',     status:'completed', bookedDate:'2026-04-16', bookedTime:'09:00 AM' },
        { id:'A008', time:'05:00 PM', date:'2026-04-22', patient:'Heba Mostafa',   ptId:'P1008', hue:260, reason:'Fatigue',             status:'pending',   bookedDate:'2026-04-16', bookedTime:'11:20 AM' },
    ];

    let filtered    = [...ALL_APPTS];
    let currentPage = 1;
    let rowsPerPage = 10;

    render();

    /* ── Filters ── */
    ['filter-date','filter-status','filter-search'].forEach(id => {
        $(id)?.addEventListener('input', applyFilters);
    });

    $('btn-clear-filters')?.addEventListener('click', () => {
        const d=$('filter-date'), s=$('filter-status'), q=$('filter-search');
        if(d) d.value=''; if(s) s.value=''; if(q) q.value='';
        applyFilters();
    });

    function applyFilters() {
        const date   = $('filter-date')?.value    || '';
        const status = $('filter-status')?.value  || '';
        const query  = ($('filter-search')?.value || '').toLowerCase().trim();
        filtered = ALL_APPTS.filter(a => {
            if (date   && a.date   !== date)                              return false;
            if (status && a.status !== status)                            return false;
            if (query  && !a.patient.toLowerCase().includes(query) && !a.ptId.toLowerCase().includes(query)) return false;
            return true;
        });
        currentPage = 1; render();
    }

    /* ── Rows per page ── */
    $('rows-per-page')?.addEventListener('change', function () {
        rowsPerPage = parseInt(this.value, 10) || 10;
        currentPage = 1; render();
    });

    /* ── View toggle ── */
    $('list-view-btn')?.addEventListener('click', () => {
        $('list-view-btn').classList.add('active');
        $('cal-view-btn').classList.remove('active');
    });
    $('cal-view-btn')?.addEventListener('click', () => {
        $('cal-view-btn').classList.add('active');
        $('list-view-btn').classList.remove('active');
        alert('Calendar view coming soon.');
        $('list-view-btn').classList.add('active');
        $('cal-view-btn').classList.remove('active');
    });

    /* ── Export ── */
    $('btn-export')?.addEventListener('click', () => alert('Export feature coming soon.'));

    /* ── Hamburger ── */
    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();

    /* ── Render ── */
    function render() {
        const tbody  = $('appt-tbody');
        const pgEl   = $('appt-pagination');
        const infoEl = $('appt-show-info');
        const count  = $('appt-count');
        if (!tbody) return;

        const total = filtered.length;
        const pages = Math.max(1, Math.ceil(total / rowsPerPage));
        if (currentPage > pages) currentPage = pages;

        if (count) count.textContent = total;

        const start = (currentPage - 1) * rowsPerPage;
        const slice = filtered.slice(start, start + rowsPerPage);

        tbody.innerHTML = '';
        if (slice.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--slate-400)">No appointments found.</td></tr>`;
        } else {
            slice.forEach(a => {
                const isConfirmed = a.status === 'confirmed';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <div class="time-col">
                            <i class="ph-bold ph-clock time-icon"></i>
                            <strong>${a.time}</strong>
                            <span>${fmt(a.date)}</span>
                        </div>
                    </td>
                    <td>
                        <div class="pt-cell">
                            <div class="pt-av" style="--hue:${a.hue}"><i class="ph-fill ph-user"></i></div>
                            <div>
                                <div class="pt-name">${a.patient}</div>
                                <div class="pt-sub">ID: ${a.ptId}</div>
                            </div>
                        </div>
                    </td>
                    <td>${a.reason}</td>
                    <td><span class="badge ${a.status}">${statusLabel(a.status)}</span></td>
                    <td>
                        <div class="booked-col">
                            <strong>${fmt(a.bookedDate)}</strong>
                            <span>${a.bookedTime}</span>
                        </div>
                    </td>
                    <td>
                        <div class="action-group">
                            ${isConfirmed
                                ? `<a href="start-consultation.html?patient=${a.ptId}" class="btn-start"><i class="ph-bold ph-play"></i> Start Consultation</a>`
                                : `<a href="appointment-details.html?id=${a.id}" class="btn-secondary"><i class="ph-bold ph-eye"></i> View Details</a>`
                            }
                            <button class="btn-more" title="More options"><i class="ph-bold ph-dots-three-vertical"></i></button>
                        </div>
                    </td>`;
                tbody.appendChild(tr);
            });
        }

        if (infoEl) infoEl.textContent = total === 0
            ? 'No appointments found'
            : `Showing ${start+1} to ${Math.min(start+rowsPerPage,total)} of ${total} appointments`;

        renderPagination(pgEl, pages);
    }

    function renderPagination(el, pages) {
        if (!el) return;
        el.innerHTML = '';
        const prev = pgBtn('<i class="ph-bold ph-caret-left"></i>');
        prev.disabled = currentPage === 1;
        prev.addEventListener('click', () => { currentPage--; render(); });
        el.appendChild(prev);

        pageNums(pages).forEach(p => {
            const btn = pgBtn(p === '…' ? '…' : p);
            if (p === '…') btn.classList.add('ellipsis');
            else {
                if (p === currentPage) btn.classList.add('active');
                btn.addEventListener('click', () => { currentPage = p; render(); });
            }
            el.appendChild(btn);
        });

        const next = pgBtn('<i class="ph-bold ph-caret-right"></i>');
        next.disabled = currentPage === pages;
        next.addEventListener('click', () => { currentPage++; render(); });
        el.appendChild(next);
    }

    function pgBtn(html) {
        const b = document.createElement('button');
        b.className = 'pg-btn'; b.innerHTML = html; return b;
    }

    function pageNums(total) {
        if(total<=7) return Array.from({length:total},(_,i)=>i+1);
        const p=[1];
        if(currentPage>3) p.push('…');
        for(let i=Math.max(2,currentPage-1);i<=Math.min(total-1,currentPage+1);i++) p.push(i);
        if(currentPage<total-2) p.push('…');
        p.push(total); return p;
    }

    function statusLabel(s) {
        return s === 'confirmed' ? 'Confirmed' : s === 'completed' ? 'Completed' : 'Pending';
    }

    function fmt(iso) {
        if(!iso) return '—';
        const [y,m,d]=iso.split('-').map(Number);
        return new Date(y,m-1,d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    }
});
