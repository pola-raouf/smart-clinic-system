document.addEventListener('DOMContentLoaded', async () => {

    try {
        const { bootRoleShell } = await import('/js/core/page-boot.js');
        await bootRoleShell('OWNER');
    } catch {
        return;
    }

    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();

    const token = localStorage.getItem('token');

    const dateLabel = document.getElementById('date-label');
    if (dateLabel) {
        dateLabel.textContent = new Date().toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
        });
    }

    function formatNumber(n) {
        if (n == null) return '0';
        return Number(n).toLocaleString();
    }

    function formatChange(percent, el) {
        el.innerHTML = '';
        if (percent == null) return;
        const abs = Math.abs(percent);
        const isUp = percent >= 0;
        el.className = 'stat-change ' + (isUp ? 'up' : 'down');
        const icon = document.createElement('i');
        icon.className = 'ph-bold ' + (isUp ? 'ph-trend-up' : 'ph-trend-down');
        el.appendChild(icon);
        el.append(' ' + abs.toFixed(1) + '%');
        const vs = document.createElement('span');
        vs.className = 'vs';
        vs.textContent = 'vs last week';
        el.appendChild(vs);
    }

    function removeSkeleton(el) {
        if (el) el.classList.remove('skeleton-line', 'skeleton-circle');
    }

    function relativeTime(isoStr) {
        if (!isoStr) return '';
        const then = new Date(isoStr);
        const diffMs = Date.now() - then.getTime();
        if (isNaN(diffMs) || diffMs < 0) return 'just now';
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return 'just now';
        if (diffMin < 60) return diffMin + ' min ago';
        const diffHr = Math.floor(diffMin / 60);
        if (diffHr < 24) return diffHr + ' hr ago';
        const diffDay = Math.floor(diffHr / 24);
        if (diffDay === 1) return 'yesterday';
        return diffDay + ' days ago';
    }

    function activityIcon(type) {
        const map = {
            MEDICAL_RECORD: { color: 'purple', icon: 'ph-file-text' },
            APPOINTMENT_BOOKED: { color: 'blue', icon: 'ph-calendar-check' },
            APPOINTMENT_CANCELLED: { color: 'red', icon: 'ph-x-circle' },
            PATIENT_REGISTERED: { color: 'green', icon: 'ph-user-plus' },
            USER_CREATED: { color: 'blue', icon: 'ph-user-plus' },
        };
        return map[type] || { color: 'blue', icon: 'ph-bell' };
    }

    async function safeFetch(url) {
        const res = await fetch(url, {
            headers: { Authorization: 'Bearer ' + token }
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
    }

    async function loadStats() {
        try {
            const data = await safeFetch('/api/owner/dashboard/stats');
            const numEl = (id) => document.getElementById(id);

            numEl('kpi-appt-num').textContent = formatNumber(data.totalAppointments);
            removeSkeleton(numEl('kpi-appt-num'));
            formatChange(data.appointmentChangePercent, numEl('kpi-appt-change'));

            numEl('kpi-patient-num').textContent = formatNumber(data.totalPatients);
            removeSkeleton(numEl('kpi-patient-num'));
            formatChange(data.patientChangePercent, numEl('kpi-patient-change'));

            numEl('kpi-doctor-num').textContent = formatNumber(data.totalDoctors);
            removeSkeleton(numEl('kpi-doctor-num'));
            numEl('kpi-doctor-change').className = 'stat-change';
            numEl('kpi-doctor-change').textContent = '—';

            numEl('kpi-cancel-num').textContent = formatNumber(data.cancelledAppointments);
            removeSkeleton(numEl('kpi-cancel-num'));
            formatChange(data.cancelledChangePercent, numEl('kpi-cancel-change'));
        } catch {
            ['kpi-appt-num','kpi-patient-num','kpi-doctor-num','kpi-cancel-num'].forEach(id => {
                const el = document.getElementById(id);
                if (el) { el.textContent = '—'; removeSkeleton(el); }
            });
        }
    }

    let apptChart = null;
    let currentPeriod = 'daily';

    async function loadApptTrend(period) {
        const canvas = document.getElementById('apptTrendChart');
        const emptyEl = document.getElementById('appt-empty');
        const errorEl = document.getElementById('appt-error');
        if (!canvas) return;

        emptyEl && (emptyEl.hidden = true);
        errorEl && (errorEl.hidden = true);

        try {
            const data = await safeFetch('/api/owner/dashboard/trend/appointments?period=' + period);
            if (!data || data.length === 0) {
                canvas.hidden = true;
                if (emptyEl) emptyEl.hidden = false;
                return;
            }
            canvas.hidden = false;
            const labels = data.map(p => p.label);
            const counts = data.map(p => p.count);

            if (apptChart) apptChart.destroy();
            apptChart = new Chart(canvas, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: 'Appointments',
                        data: counts,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59,130,246,0.08)',
                        borderWidth: 2.5,
                        pointRadius: 4,
                        pointBackgroundColor: '#3b82f6',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true, position: 'top', labels: { font: { size: 11 }, boxWidth: 14 } }
                    },
                    scales: {
                        x: { grid: { display: false }, ticks: { font: { size: 10.5 }, color: '#94a3b8' } },
                        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 10.5 }, color: '#94a3b8', precision: 0 } }
                    }
                }
            });
        } catch {
            canvas.hidden = true;
            if (errorEl) errorEl.hidden = false;
        }
    }

    const periodTabs = document.querySelectorAll('#appt-period-tabs .period-tab');
    periodTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            periodTabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPeriod = btn.dataset.period;
            loadApptTrend(currentPeriod);
        });
    });

    let patChart = null;

    async function loadPatientGrowth() {
        const canvas = document.getElementById('patientGrowthChart');
        const emptyEl = document.getElementById('pat-empty');
        const errorEl = document.getElementById('pat-error');
        if (!canvas) return;

        emptyEl && (emptyEl.hidden = true);
        errorEl && (errorEl.hidden = true);

        try {
            const data = await safeFetch('/api/owner/dashboard/trend/patients');
            if (!data || data.length === 0) {
                canvas.hidden = true;
                if (emptyEl) emptyEl.hidden = false;
                return;
            }
            canvas.hidden = false;
            const labels = data.map(p => p.label);
            const counts = data.map(p => p.count);

            if (patChart) patChart.destroy();
            patChart = new Chart(canvas, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: 'Patients',
                        data: counts,
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34,197,94,0.10)',
                        borderWidth: 2.5,
                        pointRadius: 4,
                        pointBackgroundColor: '#22c55e',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true, position: 'top', labels: { font: { size: 11 }, boxWidth: 14 } }
                    },
                    scales: {
                        x: { grid: { display: false }, ticks: { font: { size: 10.5 }, color: '#94a3b8' } },
                        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 10.5 }, color: '#94a3b8', precision: 0 } }
                    }
                }
            });
        } catch {
            canvas.hidden = true;
            if (errorEl) errorEl.hidden = false;
        }
    }

    async function loadInsights() {
        const set = (id, text) => {
            const el = document.getElementById(id);
            if (el) { el.textContent = text; removeSkeleton(el); }
        };

        const setChange = (id, percent) => {
            const el = document.getElementById(id);
            if (!el) return;
            removeSkeleton(el);
            const abs = Math.abs(percent || 0).toFixed(1);
            const isUp = (percent || 0) >= 0;
            el.className = isUp ? 'up' : 'down';
            el.innerHTML = '<i class="ph-bold ' + (isUp ? 'ph-trend-up' : 'ph-trend-down') + '"></i> ' + abs + '%';
        };

        try {
            const data = await safeFetch('/api/owner/dashboard/insights');
            set('qi-cancel-rate', (data.cancellationRate != null ? data.cancellationRate.toFixed(1) : '0.0') + '%');
            setChange('qi-cancel-trend', data.cancellationRateChangePercent);
            set('qi-completed-today', formatNumber(data.completedToday));
            setChange('qi-completed-trend', data.completedTodayChangePercent);
            set('qi-weekly', formatNumber(data.weeklyAppointments));
            setChange('qi-weekly-trend', data.weeklyChangePercent);
        } catch {
            ['qi-cancel-rate','qi-completed-today','qi-weekly'].forEach(id => set(id, '—'));
            ['qi-cancel-trend','qi-completed-trend','qi-weekly-trend'].forEach(id => {
                const el = document.getElementById(id);
                if (el) { removeSkeleton(el); el.textContent = '—'; }
            });
        }
    }

    async function loadActivity() {
        const feed = document.getElementById('activity-feed');
        const emptyEl = document.getElementById('activity-empty');
        const errorEl = document.getElementById('activity-error');
        if (!feed) return;

        try {
            const data = await safeFetch('/api/owner/dashboard/activity?limit=8');
            feed.innerHTML = '';
            if (!data || data.length === 0) {
                feed.hidden = true;
                if (emptyEl) emptyEl.hidden = false;
                return;
            }
            feed.hidden = false;
            data.forEach(item => {
                const meta = activityIcon(item.type);
                const li = document.createElement('li');
                li.className = 'activity-item';
                li.innerHTML =
                    '<div class="act-icon ' + (item.iconColor || meta.color) + '">' +
                        '<i class="ph-bold ' + meta.icon + '"></i>' +
                    '</div>' +
                    '<div class="act-info">' +
                        '<div class="act-action">' + (item.description || '') + '</div>' +
                        '<div class="act-patient">' + (item.actor || '') + '</div>' +
                    '</div>' +
                    '<div class="act-time">' + relativeTime(item.timestamp) + '</div>';
                feed.appendChild(li);
            });
        } catch {
            feed.innerHTML = '';
            feed.hidden = true;
            if (errorEl) errorEl.hidden = false;
        }
    }

    await Promise.allSettled([
        loadStats(),
        loadApptTrend('daily'),
        loadPatientGrowth(),
        loadInsights(),
        loadActivity()
    ]);
});
