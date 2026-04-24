/* ================================================
   dashboard.js  –  Owner Dashboard
   ================================================ */

document.addEventListener('DOMContentLoaded', async () => {

    try {
        const { bootRoleShell } = await import('/js/core/page-boot.js');
        await bootRoleShell('OWNER');
    } catch {
        return;
    }

    /* ── Hamburger ── */
    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();

    /* ── Date label ── */
    const today = new Date();
    const dateLabel = document.getElementById('date-label');
    if (dateLabel) {
        dateLabel.textContent = today.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    }

    /* ── APPOINTMENTS TREND CHART ── */
    const apptCtx = document.getElementById('apptTrendChart');
    if (apptCtx) {
        new Chart(apptCtx, {
            type: 'line',
            data: {
                labels: ['May 13','May 14','May 15','May 16','May 17','May 18','May 19'],
                datasets: [{
                    label: 'Appointments',
                    data: [260, 310, 290, 340, 370, 400, 420],
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
                    legend: { display: true, position:'top', labels:{ font:{size:11}, boxWidth:14 } }
                },
                scales: {
                    x: { grid:{ display:false }, ticks:{ font:{size:10.5}, color:'#94a3b8' } },
                    y: { beginAtZero:false, grid:{ color:'rgba(0,0,0,0.04)' }, ticks:{ font:{size:10.5}, color:'#94a3b8' } }
                }
            }
        });
    }

    /* ── PATIENT GROWTH CHART ── */
    const patCtx = document.getElementById('patientGrowthChart');
    if (patCtx) {
        new Chart(patCtx, {
            type: 'line',
            data: {
                labels: ['Jan','Feb','Mar','Apr','May'],
                datasets: [{
                    label: 'New Patients',
                    data: [280, 380, 440, 520, 650],
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
                    legend: { display:true, position:'top', labels:{ font:{size:11}, boxWidth:14 } }
                },
                scales: {
                    x: { grid:{ display:false }, ticks:{ font:{size:10.5}, color:'#94a3b8' } },
                    y: { beginAtZero:false, grid:{ color:'rgba(0,0,0,0.04)' }, ticks:{ font:{size:10.5}, color:'#94a3b8' } }
                }
            }
        });
    }
});
