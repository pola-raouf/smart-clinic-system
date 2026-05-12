/* ================================================
   dashboard.js  –  Patient Dashboard (CONNECTED)
   ================================================ */

document.addEventListener('DOMContentLoaded', async () => {

    const $ = id => document.getElementById(id);

    try {
        const { requireAuth, requireRole } = await import('/js/core/auth.js');
        requireAuth();
        requireRole('PATIENT');
    } catch {
        return;
    }

    let user = null;

    /* ──────────────────────────────────────────
       LOAD USER FROM BACKEND
    ────────────────────────────────────────── */
    async function loadUser() {
        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/pages/login.html";
            return;
        }

        try {
            const res = await fetch("/api/user/me", {
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (!res.ok) throw new Error("Unauthorized");

            const data = await res.json();

            user = {
                id: data.id,
                name: data.name,
                email: data.email || '',
                phone: data.phoneNumber,
                address: data.address,
                visitCount: data.visitCount != null ? Number(data.visitCount) : 0,
            };

            /* ─── Update UI ─── */
            setText('user-name', user.name.split(' ')[0]);
            setText('profile-name', user.name);
            setText('profile-id', 'P-' + user.id.toString().padStart(4, '0'));
            setText('profile-phone', user.phone || '—');
            setText('profile-email', user.email || '—');
            setText('profile-address', user.address || '—');
            setText('stat-visits-num', String(user.visitCount));

            const dateEl = $('dash-date');
            if (dateEl) {
                dateEl.textContent = new Date().toLocaleDateString('en-US', {
                    weekday:'long', year:'numeric', month:'long', day:'numeric'
                });
            }

            // 🔥 Load rest AFTER user is ready
            await loadAppointmentsAndRender();

        } catch (err) {
            console.error("Auth error:", err);
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "/pages/login.html";
        }
    }

    /* ──────────────────────────────────────────
       APPOINTMENTS (same logic)
    ────────────────────────────────────────── */
    let pendingCancelId = null;
    const hues = [215,160,200,340,30,280,50,190];

    let allAppointments = [];

    async function loadAppointmentsAndRender() {
        const list = $('upcoming-list');
        const tbody = $('history-tbody');
        if (list) list.innerHTML = `<div style="text-align: center; padding: 1rem;"><i class="ph-bold ph-spinner ph-spin"></i> Loading...</div>`;
        if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;"><i class="ph-bold ph-spinner ph-spin"></i> Loading...</td></tr>`;

        try {
            allAppointments = await AppointmentService.getPatientAppointments(user.id);
        } catch (err) {
            console.error(err);
            if (list) list.innerHTML = `<div style="color: red; text-align: center; padding: 1rem;">Failed to load appointments</div>`;
            if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: red;">Failed to load appointments</td></tr>`;
            return;
        }

        renderUpcoming();
        await renderHistory();
    }

    function renderUpcoming() {
        if (!user) return;

        const all = allAppointments.filter(a =>
            a.status === 'CONFIRMED' || a.status === 'BOOKED' || a.status === 'PENDING'
        );

        const today = new Date();
        today.setHours(0,0,0,0);

        const upcoming = all.filter(a => new Date(a.date) >= today)
            .sort((x,y) => new Date(x.date) - new Date(y.date));

        setText('stat-upcoming-num', upcoming.length);

        const list = $('upcoming-list');
        const none = $('no-upcoming');
        if (!list) return;
        list.innerHTML = '';

        if (upcoming.length === 0) {
            none?.removeAttribute('hidden');
            return;
        }
        none?.setAttribute('hidden','');

        upcoming.slice(0, 5).forEach(appt => {
            const hue = hues[Number(appt.doctorId) - 1] || 215;
            const status = toDisplayStatus(appt.status);
            const div = document.createElement('div');
            div.className = 'appt-item';
            div.innerHTML = `
                <div class="appt-avatar" style="--hue:${hue}">
                    <i class="ph-fill ph-user"></i>
                </div>
                <div class="appt-info">
                    <p class="appt-doctor">${escHtml(appt.doctorName)}</p>
                    <p class="appt-spec">${escHtml(appt.specialty || '—')}</p>
                    <div class="appt-meta">
                        <span><i class="ph-bold ph-calendar"></i> ${formatDate(appt.date)}</span>
                        <span><i class="ph-bold ph-clock"></i> ${escHtml(appt.time)}</span>
                        <span><i class="ph-bold ph-map-pin"></i> Smart Clinic, Cairo</span>
                    </div>
                </div>
                <div class="appt-right">
                    <span class="status-badge ${status.key}">${status.label}</span>
                    <div class="appt-actions">
                        <a href="appointments.html?appointmentId=${appt.id}" class="btn-view-appt">
                            <i class="ph-bold ph-eye"></i> Details
                        </a>
                        <button class="btn-cancel-appt" data-id="${appt.id}">Cancel</button>
                    </div>
                </div>
            `;
            list.appendChild(div);
        });

        list.querySelectorAll('.btn-cancel-appt').forEach(btn => {
            btn.addEventListener('click', async () => {
                pendingCancelId = btn.dataset.id;
                $('cancel-overlay')?.removeAttribute('hidden');
            });
        });
    }

    /* ──────────────────────────────────────────
       MEDICAL HISTORY (API — completed visits)
    ────────────────────────────────────────── */
    async function renderHistory() {
        if (!user) return;

        const tbody = $('history-tbody');
        const none = $('no-history');
        if (!tbody) return;
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:12px"><i class="ph-bold ph-spinner ph-spin"></i> Loading…</td></tr>`;

        let reports = [];
        try {
            reports = await AppointmentService.getPatientMedicalReports();
        } catch (e) {
            console.error(e);
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#f87171">Could not load history.</td></tr>`;
            return;
        }

        const rows = (reports || [])
            .filter((r) => r.appointmentId)
            .sort((a, b) => {
                const da = a.visitDate || (a.createdAt ? String(a.createdAt).slice(0, 10) : '');
                const db = b.visitDate || (b.createdAt ? String(b.createdAt).slice(0, 10) : '');
                return db.localeCompare(da);
            })
            .slice(0, 8);

        tbody.innerHTML = '';
        if (rows.length === 0) {
            none?.removeAttribute('hidden');
            return;
        }
        none?.setAttribute('hidden', '');

        rows.forEach((row) => {
            const dateStr = row.visitDate || (row.createdAt ? String(row.createdAt).slice(0, 10) : '');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatDate(dateStr)}</td>
                <td>${escHtml(row.diagnosis || row.chiefComplaint || '—')}</td>
                <td>${escHtml(row.doctorName || '—')}</td>
                <td>
                  <a href="view-report.html?appointment=${encodeURIComponent(row.appointmentId)}" class="btn-report">
                    <i class="ph-bold ph-file-text"></i> View Report
                  </a>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    /* ──────────────────────────────────────────
       CANCEL MODAL
    ────────────────────────────────────────── */
    $('cancel-yes')?.addEventListener('click', async () => {
        if (!pendingCancelId) return;
        try {
            const btn = $('cancel-yes');
            const originalText = btn.innerHTML;
            btn.innerHTML = `<i class="ph-bold ph-spinner ph-spin"></i> Cancelling...`;
            btn.disabled = true;

            await AppointmentService.cancel(pendingCancelId);
            
            btn.innerHTML = originalText;
            btn.disabled = false;
            
            pendingCancelId = null;
            $('cancel-overlay')?.setAttribute('hidden','');
            
            await loadAppointmentsAndRender();
            showToast('Appointment cancelled.');
        } catch (err) {
            alert('Failed to cancel: ' + err.message);
            $('cancel-yes').disabled = false;
            $('cancel-yes').innerHTML = `Yes, Cancel`;
        }
    });

    $('cancel-no')?.addEventListener('click', () => {
        pendingCancelId = null;
        $('cancel-overlay')?.setAttribute('hidden','');
    });

    $('cancel-overlay')?.addEventListener('click', e => {
        if (e.target === $('cancel-overlay')) {
            pendingCancelId = null;
            $('cancel-overlay').setAttribute('hidden','');
        }
    });

    /* ──────────────────────────────────────────
       NAVBAR
    ────────────────────────────────────────── */
    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();

    /* ──────────────────────────────────────────
       HELPERS
    ────────────────────────────────────────── */
    function showToast(msg) {
        const t = $('toast');
        if (!t) return;
        $('toast-msg').textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3000);
    }

    function formatDate(iso) {
        if (!iso) return '—';
        const [y,m,d] = iso.split('-').map(Number);
        return new Date(y, m-1, d).toLocaleDateString('en-US',{
            month:'short', day:'numeric', year:'numeric'
        });
    }

    function escHtml(str) {
        const el = document.createElement('div');
        el.textContent = str || '';
        return el.innerHTML;
    }

    function setText(id, val) {
        const el = $(id);
        if (el) el.textContent = val;
    }

    function toDisplayStatus(rawStatus) {
        const status = String(rawStatus || '').toUpperCase();
        if (status === 'BOOKED' || status === 'PENDING') return { key: 'pending', label: 'Pending' };
        if (status === 'CONFIRMED') return { key: 'confirmed', label: 'Confirmed' };
        if (status === 'COMPLETED') return { key: 'completed', label: 'Completed' };
        if (status === 'CANCELLED') return { key: 'cancelled', label: 'Cancelled' };
        return { key: 'pending', label: 'Pending' };
    }

    /* ──────────────────────────────────────────
       INIT
    ────────────────────────────────────────── */
    loadUser();
});