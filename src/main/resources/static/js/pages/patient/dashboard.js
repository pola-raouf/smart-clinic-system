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
                address: data.address
            };

            /* ─── Update UI ─── */
            setText('user-name', user.name.split(' ')[0]);
            setText('profile-name', user.name);
            setText('profile-id', 'P-' + user.id.toString().padStart(4, '0'));
            setText('profile-phone', user.phone || '—');
            setText('profile-email', user.email || '—');
            setText('profile-address', user.address || '—');

            const dateEl = $('dash-date');
            if (dateEl) {
                dateEl.textContent = new Date().toLocaleDateString('en-US', {
                    weekday:'long', year:'numeric', month:'long', day:'numeric'
                });
            }

            // 🔥 Load rest AFTER user is ready
            renderUpcoming();
            renderHistory();

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

    function renderUpcoming() {
        if (!user) return;

        const all = AppointmentService.getAll().filter(a =>
            a.patientId == user.id && a.status === 'confirmed'
        );

        const today = new Date();
        today.setHours(0,0,0,0);

        const upcoming = all.filter(a => new Date(a.date) >= today)
            .sort((x,y) => new Date(x.date) - new Date(y.date));

        setText('stat-upcoming-num', upcoming.length);
        setText('stat-visits-num',   all.length);

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
                    <span class="status-badge confirmed">Confirmed</span>
                    <div class="appt-actions">
                        <a href="book-appointment.html?id=${appt.doctorId}" class="btn-view-appt">
                            <i class="ph-bold ph-eye"></i> Details
                        </a>
                        <button class="btn-cancel-appt" data-id="${appt.id}">Cancel</button>
                    </div>
                </div>
            `;
            list.appendChild(div);
        });

        list.querySelectorAll('.btn-cancel-appt').forEach(btn => {
            btn.addEventListener('click', () => {
                pendingCancelId = btn.dataset.id;
                $('cancel-overlay')?.removeAttribute('hidden');
            });
        });
    }

    /* ──────────────────────────────────────────
       MEDICAL HISTORY (same)
    ────────────────────────────────────────── */
    const SAMPLE = ['General Check-up','Routine Blood Work','Flu Treatment','Follow-up Visit','Dental Cleaning','Annual Physical'];
    const DEMO_HISTORY = [
        { date:'2026-03-14', diagnosis:'General Check-up', doctor:'Dr. Ahmed Ali' },
        { date:'2026-02-20', diagnosis:'Blood Pressure Review', doctor:'Dr. Sara Hassan' },
        { date:'2026-01-08', diagnosis:'Flu Treatment', doctor:'Dr. Mohamed Said' },
    ];

    function renderHistory() {
        if (!user) return;

        const tbody = $('history-tbody');
        const none  = $('no-history');
        if (!tbody) return;
        tbody.innerHTML = '';

        const today = new Date(); today.setHours(0,0,0,0);

        const past = AppointmentService.getAll().filter(a =>
            a.patientId == user.id && a.status === 'confirmed' && new Date(a.date) < today
        ).sort((x,y) => new Date(y.date) - new Date(x.date));

        const rows = [
            ...past.map((a,i) => ({
                date:a.date,
                diagnosis:SAMPLE[i % SAMPLE.length],
                doctor:a.doctorName
            })),
            ...DEMO_HISTORY,
        ].slice(0, 6);

        if (rows.length === 0) {
            none?.removeAttribute('hidden');
            return;
        }
        none?.setAttribute('hidden','');

        rows.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatDate(row.date)}</td>
                <td>${escHtml(row.diagnosis)}</td>
                <td>${escHtml(row.doctor)}</td>
                <td><a href="view-report.html" class="btn-report">
                    <i class="ph-bold ph-file-text"></i> View Report
                </a></td>
            `;
            tbody.appendChild(tr);
        });
    }

    /* ──────────────────────────────────────────
       CANCEL MODAL
    ────────────────────────────────────────── */
    $('cancel-yes')?.addEventListener('click', () => {
        if (!pendingCancelId) return;
        AppointmentService.cancel(pendingCancelId);
        pendingCancelId = null;
        $('cancel-overlay')?.setAttribute('hidden','');
        renderUpcoming();
        showToast('Appointment cancelled.');
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

    /* ──────────────────────────────────────────
       INIT
    ────────────────────────────────────────── */
    loadUser();
});