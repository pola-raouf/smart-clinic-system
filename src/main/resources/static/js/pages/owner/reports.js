/* ================================================
   reports.js  –  Owner Reports & Analytics
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

    /* ── Period toggle ── */
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    /* ── Table data ── */
    const TABLE_DATA = [
        { date:'May 13, 2025', total:15, completed:12, cancelled:1, noshow:2 },
        { date:'May 14, 2025', total:18, completed:14, cancelled:2, noshow:2 },
        { date:'May 15, 2025', total:20, completed:16, cancelled:2, noshow:2 },
        { date:'May 16, 2025', total:22, completed:18, cancelled:2, noshow:2 },
        { date:'May 17, 2025', total:16, completed:12, cancelled:1, noshow:3 },
        { date:'May 18, 2025', total:14, completed:10, cancelled:1, noshow:3 },
        { date:'May 19, 2025', total:15, completed:13, cancelled:1, noshow:1 },
    ];

    const tbody = document.getElementById('detail-tbody');
    if (tbody) {
        TABLE_DATA.forEach(row => {
            const rate = ((row.completed / row.total) * 100).toFixed(1) + '%';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.date}</td>
                <td>${row.total}</td>
                <td>${row.completed}</td>
                <td>${row.cancelled}</td>
                <td>${row.noshow}</td>
                <td class="completion-rate">${rate}</td>`;
            tbody.appendChild(tr);
        });
    }

    /* ── Appointments Overview Chart ── */
    const apptCtx = document.getElementById('rptApptChart');
    if (apptCtx) {
        new Chart(apptCtx, {
            type: 'line',
            data: {
                labels: ['May 13','May 14','May 15','May 16','May 17','May 18','May 19'],
                datasets: [{
                    label: 'Appointments',
                    data: [15, 18, 20, 22, 16, 14, 15],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59,130,246,0.07)',
                    borderWidth: 2.5, pointRadius: 4,
                    pointBackgroundColor: '#3b82f6',
                    fill: true, tension: 0.3
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display:true, position:'top', labels:{ font:{size:11}, boxWidth:14 } } },
                scales: {
                    x: { grid:{display:false}, ticks:{font:{size:10}, color:'#94a3b8'} },
                    y: { beginAtZero:true, grid:{color:'rgba(0,0,0,0.04)'}, ticks:{font:{size:10}, color:'#94a3b8'} }
                }
            }
        });
    }

    /* ── Patient Growth Chart ── */
    const patCtx = document.getElementById('rptPatientChart');
    if (patCtx) {
        new Chart(patCtx, {
            type: 'line',
            data: {
                labels: ['Jan','Feb','Mar','Apr','May'],
                datasets: [{
                    label: 'New Patients',
                    data: [40, 52, 61, 75, 90],
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34,197,94,0.10)',
                    borderWidth: 2.5, pointRadius: 4,
                    pointBackgroundColor: '#22c55e',
                    fill: true, tension: 0.4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display:true, position:'top', labels:{ font:{size:11}, boxWidth:14 } } },
                scales: {
                    x: { grid:{display:false}, ticks:{font:{size:10}, color:'#94a3b8'} },
                    y: { beginAtZero:false, grid:{color:'rgba(0,0,0,0.04)'}, ticks:{font:{size:10}, color:'#94a3b8'} }
                }
            }
        });
    }

    /* ── Pie Chart ── */
    const pieCtx = document.getElementById('rptPieChart');
    if (pieCtx) {
        new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: ['Completed','Cancelled','No-show'],
                datasets: [{
                    data: [79.2, 8.3, 12.5],
                    backgroundColor: ['#3b82f6','#f97316','#a78bfa'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: false,
                cutout: '68%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}%` }
                    }
                }
            }
        });
    }

    /* ── Export PDF ── */
    document.getElementById('btn-export-pdf')?.addEventListener('click', () => {
        window.open('report-print.html', '_blank');
    });

    /* ── Export Excel (demo) ── */
    document.getElementById('btn-export-excel')?.addEventListener('click', () => {
        const rows = [
            ['Date','Total Appointments','Completed','Cancelled','No-show','Completion Rate'],
            ...TABLE_DATA.map(r => [r.date, r.total, r.completed, r.cancelled, r.noshow,
                ((r.completed/r.total)*100).toFixed(1)+'%']),
            ['Total', 120, 95, 10, 15, '79.2%']
        ];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], {type:'text/csv'});
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = 'clinic-report.csv';
        a.click(); URL.revokeObjectURL(url);
    });
});
