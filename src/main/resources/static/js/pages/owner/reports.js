/* ================================================
   reports.js  –  Owner Reports & Analytics (Dynamic)
   ================================================ */

document.addEventListener('DOMContentLoaded', async () => {

    try {
        const { bootRoleShell } = await import('/js/core/page-boot.js');
        await bootRoleShell('OWNER');
    } catch {
        return;
    }

    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();

    const token = localStorage.getItem('token');

    // DOM Elements
    const fromInput = document.getElementById('filter-from');
    const toInput = document.getElementById('filter-to');
    const docSelect = document.getElementById('filter-doctor');
    const btnApply = document.getElementById('btn-apply-filters');
    const btnPdf = document.getElementById('btn-export-pdf');
    const btnCsv = document.getElementById('btn-export-excel');
    
    // Set default dates (last 30 days)
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setDate(today.getDate() - 30);
    
    toInput.value = today.toISOString().split('T')[0];
    fromInput.value = lastMonth.toISOString().split('T')[0];

    async function loadDoctors() {
        try {
            const res = await fetch('/api/public/doctors', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (res.ok) {
                const docs = await res.json();
                docs.forEach(d => {
                    const opt = document.createElement('option');
                    opt.value = d.id;
                    opt.textContent = d.name;
                    docSelect.appendChild(opt);
                });
            }
        } catch (e) {
            console.error('Failed to load doctors', e);
        }
    }

    function removeSkeleton(el) {
        if (el) el.classList.remove('skeleton-line', 'skeleton-circle');
    }

    function getQueryString() {
        const from = fromInput.value;
        const to = toInput.value;
        const doc = docSelect.value;
        let qs = `?from=${from}&to=${to}`;
        if (doc) qs += `&doctorId=${doc}`;
        return qs;
    }

    async function loadKPIs(qs) {
        try {
            const res = await fetch('/api/owner/reports/kpis' + qs, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            
            const set = (id, val) => {
                const el = document.getElementById(id);
                if (el) { el.textContent = val; removeSkeleton(el); }
            };
            
            set('kpi-total', data.totalAppointments);
            set('kpi-completed', data.completed);
            set('kpi-completed-pct', data.completionRate + '% of total');
            set('kpi-cancelled', data.cancelled);
            set('kpi-cancelled-pct', data.cancellationRate + '% of total');
            set('kpi-noshow', data.noShow);
            set('kpi-noshow-pct', data.noShowRate + '% of total');
            
            updatePieChart(data);
        } catch {
            // error state
        }
    }

    let apptChart = null;
    async function loadApptTrend(qs) {
        try {
            const res = await fetch('/api/owner/reports/trend/appointments' + qs, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            
            const canvas = document.getElementById('rptApptChart');
            const emptyEl = document.getElementById('chart-appt-empty');
            if (data.length === 0) {
                canvas.hidden = true;
                emptyEl.hidden = false;
                return;
            }
            canvas.hidden = false;
            emptyEl.hidden = true;
            
            if (apptChart) apptChart.destroy();
            apptChart = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: data.map(d => d.label),
                    datasets: [{
                        label: 'Appointments',
                        data: data.map(d => d.count),
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
                        y: { beginAtZero:true, grid:{color:'rgba(0,0,0,0.04)'}, ticks:{font:{size:10}, color:'#94a3b8', precision: 0} }
                    }
                }
            });
        } catch {}
    }

    let patChart = null;
    async function loadPatientGrowth() {
        try {
            const res = await fetch('/api/owner/reports/trend/patients', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            
            const canvas = document.getElementById('rptPatientChart');
            const emptyEl = document.getElementById('chart-pat-empty');
            if (data.length === 0) {
                canvas.hidden = true;
                emptyEl.hidden = false;
                return;
            }
            canvas.hidden = false;
            emptyEl.hidden = true;
            
            if (patChart) patChart.destroy();
            patChart = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: data.map(d => d.label),
                    datasets: [{
                        label: 'Total Patients',
                        data: data.map(d => d.count),
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
                        y: { beginAtZero:false, grid:{color:'rgba(0,0,0,0.04)'}, ticks:{font:{size:10}, color:'#94a3b8', precision:0} }
                    }
                }
            });
        } catch {}
    }

    let pieChart = null;
    function updatePieChart(kpi) {
        const canvas = document.getElementById('rptPieChart');
        const emptyEl = document.getElementById('chart-pie-empty');
        const legend = document.getElementById('pie-legend-container');
        
        if (kpi.totalAppointments === 0) {
            canvas.hidden = true;
            emptyEl.hidden = false;
            legend.style.display = 'none';
            return;
        }
        canvas.hidden = false;
        emptyEl.hidden = true;
        legend.style.display = 'flex';
        
        document.getElementById('leg-completed').textContent = kpi.completionRate + '%';
        document.getElementById('leg-cancelled').textContent = kpi.cancellationRate + '%';
        document.getElementById('leg-noshow').textContent = kpi.noShowRate + '%';

        if (pieChart) pieChart.destroy();
        pieChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Completed','Cancelled','No-show'],
                datasets: [{
                    data: [kpi.completed, kpi.cancelled, kpi.noShow],
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
                        callbacks: {
                            label: function(ctx) {
                                let label = ctx.label || '';
                                if (label) label += ': ';
                                label += ctx.raw;
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    async function loadTable(qs) {
        try {
            const res = await fetch('/api/owner/reports/table' + qs, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            
            const tbody = document.getElementById('detail-tbody');
            const tfoot = document.getElementById('detail-tfoot');
            const emptyEl = document.getElementById('table-empty');
            
            tbody.innerHTML = '';
            
            if (data.length === 0) {
                tfoot.style.display = 'none';
                emptyEl.style.display = 'block';
                return;
            }
            emptyEl.style.display = 'none';
            tfoot.style.display = '';
            
            let tTotal=0, tComp=0, tCanc=0, tNo=0;
            
            data.forEach(row => {
                tTotal += row.total;
                tComp += row.completed;
                tCanc += row.cancelled;
                tNo += row.noShow;
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.date}</td>
                    <td>${row.total}</td>
                    <td>${row.completed}</td>
                    <td>${row.cancelled}</td>
                    <td>${row.noShow}</td>
                    <td class="completion-rate">${row.completionRate}</td>`;
                tbody.appendChild(tr);
            });
            
            document.getElementById('tf-total').textContent = tTotal;
            document.getElementById('tf-completed').textContent = tComp;
            document.getElementById('tf-cancelled').textContent = tCanc;
            document.getElementById('tf-noshow').textContent = tNo;
            document.getElementById('tf-rate').textContent = tTotal > 0 ? ((tComp/tTotal)*100).toFixed(1)+'%' : '0.0%';
            
        } catch {}
    }

    function refreshAll() {
        const qs = getQueryString();
        loadKPIs(qs);
        loadApptTrend(qs);
        loadTable(qs);
    }

    btnApply.addEventListener('click', refreshAll);

    async function downloadExport(url, filename) {
        try {
            const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
            if (!res.ok) throw new Error('Export failed');
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(objectUrl);
        } catch (e) {
            console.error(e);
            alert('Failed to export. Please try again.');
        }
    }

    btnPdf.addEventListener('click', () => {
        downloadExport('/api/owner/reports/export/pdf' + getQueryString(), 'clinic-report.pdf');
    });

    btnCsv.addEventListener('click', () => {
        downloadExport('/api/owner/reports/export/csv' + getQueryString(), 'clinic-report.csv');
    });

    // Init
    await loadDoctors();
    refreshAll();
    loadPatientGrowth(); // Independent of date filters usually, per requirements it's monthly overall
});
