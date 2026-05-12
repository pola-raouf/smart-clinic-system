/* ================================================
  appointments.js  –  Doctor Appointments
  ================================================ */

document.addEventListener('DOMContentLoaded', async () => {

    try {
        const { bootRoleShell } = await import('/js/core/page-boot.js');
        await bootRoleShell('DOCTOR');
    } catch {
        return;
    }

    const $ = id => document.getElementById(id);
    let allAppointments = [];
    let filtered = [];
    let currentPage = 1;
    let rowsPerPage = 10;

    try {
        const me = await AppointmentService.getCurrentUser();
        const doctors = await AppointmentService.getDoctors();

        // Resolve doctor ID robustly across environments:
        // - preferred: doctor.userId === current user id
        // - fallback: doctor.id === current user id (some datasets use this)
        // - fallback: persisted doctorId from localStorage
        const doctorByUser = doctors.find(d => Number(d.userId) === Number(me.id));
        const doctorById = doctors.find(d => Number(d.id) === Number(me.id));
        const storedDoctorId = Number(localStorage.getItem('doctorId'));
        const doctorByStoredId = doctors.find(d => Number(d.id) === storedDoctorId);
        const doctor = doctorByUser || doctorById || doctorByStoredId;

        if (!doctor || !doctor.id) {
            throw new Error('Doctor profile not linked to current user.');
        }

        localStorage.setItem('doctorId', String(doctor.id));
        allAppointments = await AppointmentService.getDoctorAppointments(doctor.id);
        filtered = [...allAppointments];
    } catch (err) {
        const tbody = $('appt-tbody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--slate-400)">${err.message || 'Failed to load appointments.'}</td></tr>`;
        }
    }
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
        filtered = allAppointments.filter(a => {
            if (date   && a.date   !== date)                              return false;
            if (status && String(a.status || '').toLowerCase() !== status) return false;
            if (query) {
                const patientName = (a.patientName || '').toLowerCase();
                const patientId = String(a.patientId || '').toLowerCase();
                if (!patientName.includes(query) && !patientId.includes(query)) return false;
            }
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
                const statusKey = String(a.status || '').toLowerCase();
                const isConfirmed = statusKey === 'confirmed';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <div class="time-col">
                            <i class="ph-bold ph-clock time-icon"></i>
                            <strong>${(a.time || '—').substring(0, 5)}</strong>
                            <span>${fmt(a.date)}</span>
                        </div>
                    </td>
                    <td>
                        <div class="pt-cell">
                            <div class="pt-av" style="--hue:215"><i class="ph-fill ph-user"></i></div>
                            <div>
                                <div class="pt-name">${a.patientName || 'Patient'}</div>
                                <div class="pt-sub">ID: ${a.patientId || '—'}</div>
                            </div>
                        </div>
                    </td>
                    <td>${a.specialty || 'General Consultation'}</td>
                    <td><span class="badge ${statusKey}">${statusLabel(statusKey)}</span></td>
                    <td>
                        <div class="booked-col">
                            <strong>${fmt(a.date)}</strong>
                            <span>${(a.time || '—').substring(0, 5)}</span>
                        </div>
                    </td>
                    <td>
                        <div class="action-group">
                            ${isConfirmed
                                ? `<a href="start-consultation.html?patient=${encodeURIComponent(a.patientId)}&appointment=${encodeURIComponent(a.id)}" class="btn-start"><i class="ph-bold ph-play"></i> Start Consultation</a>`
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
        if (s === 'booked' || s === 'pending') return 'Pending';
        if (s === 'confirmed') return 'Confirmed';
        if (s === 'completed') return 'Completed';
        if (s === 'cancelled') return 'Cancelled';
        return 'Pending';
    }

    function fmt(iso) {
        if(!iso) return '—';
        const [y,m,d]=iso.split('-').map(Number);
        return new Date(y,m-1,d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    }
});
