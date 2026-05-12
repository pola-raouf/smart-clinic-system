/* ================================================
   activity-log.js  –  System Logs Page
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

    const btnApply = document.getElementById('btn-apply-filters');
    const btnRefresh = document.getElementById('btn-refresh');
    const tbody = document.getElementById('log-tbody');
    const emptyEl = document.getElementById('log-empty');
    const loadingEl = document.getElementById('log-loading');

    const filterLevel = document.getElementById('filter-level');
    const filterModule = document.getElementById('filter-module');
    const filterRole = document.getElementById('filter-role');

    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                     .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    function levelBadge(lvl) {
        let cls = 'info';
        if (lvl === 'WARN') cls = 'warn';
        if (lvl === 'ERROR') cls = 'error';
        return `<span class="badge level-${cls}">${escapeHtml(lvl)}</span>`;
    }

    function statusBadge(sts) {
        if (!sts || sts === 'N/A') return 'N/A';
        let cls = 'success';
        if (sts === 'FAILURE' || sts === 'ERROR') cls = 'failure';
        if (sts === 'WARNING') cls = 'warning';
        return `<span class="badge status-${cls}">${escapeHtml(sts)}</span>`;
    }

    async function fetchLogs() {
        tbody.innerHTML = '';
        emptyEl.style.display = 'none';
        loadingEl.style.display = 'block';

        let qs = '?';
        if (filterLevel.value) qs += `level=${encodeURIComponent(filterLevel.value)}&`;
        if (filterModule.value) qs += `module=${encodeURIComponent(filterModule.value)}&`;
        if (filterRole.value) qs += `role=${encodeURIComponent(filterRole.value)}&`;

        try {
            const res = await fetch('/api/owner/logs' + qs, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error('Failed to fetch logs');
            
            const logs = await res.json();
            loadingEl.style.display = 'none';

            if (logs.length === 0) {
                emptyEl.style.display = 'block';
                return;
            }

            logs.forEach(log => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="font-family:monospace; font-size:12px; color:var(--slate-500);">${escapeHtml(log.timestamp)}</td>
                    <td>${levelBadge(log.level)}</td>
                    <td style="font-weight:600;">${escapeHtml(log.eventType)}</td>
                    <td>${escapeHtml(log.user)}</td>
                    <td>${escapeHtml(log.role)}</td>
                    <td>${escapeHtml(log.action)}</td>
                    <td>${escapeHtml(log.module)}</td>
                    <td>${statusBadge(log.status)}</td>
                    <td class="msg-col" title="${escapeHtml(log.message)}">${escapeHtml(log.message)}</td>
                `;
                tbody.appendChild(tr);
            });
            
        } catch (e) {
            loadingEl.style.display = 'none';
            emptyEl.textContent = 'Error loading logs. Please try again later.';
            emptyEl.style.display = 'block';
            console.error(e);
        }
    }

    btnApply.addEventListener('click', fetchLogs);
    btnRefresh.addEventListener('click', fetchLogs);

    // Initial load
    fetchLogs();
});
