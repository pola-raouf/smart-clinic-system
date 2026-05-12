/* ================================================
   notifications.js  –  Shared Full Page Logic
   ================================================ */

document.addEventListener('DOMContentLoaded', async () => {

    const role = localStorage.getItem('role');
    try {
        const { bootRoleShell } = await import('/js/core/page-boot.js');
        await bootRoleShell(role);
    } catch {
        return;
    }

    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();

    const token = localStorage.getItem('token');
    if(!token) return;

    let currentPage = 0;
    const pageSize = 15;
    let hasMore = true;

    const listContainer = document.getElementById('full-notif-list');
    const emptyState = document.getElementById('notif-empty');
    const btnPrev = document.getElementById('btn-prev-page');
    const btnNext = document.getElementById('btn-next-page');
    const pageInfo = document.getElementById('page-info');
    const btnMarkAll = document.getElementById('btn-mark-all-page');

    function timeAgo(dateString) {
        const date = new Date(dateString);
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " mins ago";
        return "Just now";
    }

    function getNotifIconFull(type) {
        if(type.includes('BOOKED')) return '<i class="ph-bold ph-calendar-plus" style="color:#3b82f6;"></i>';
        if(type.includes('CONFIRMED')) return '<i class="ph-bold ph-calendar-check" style="color:#22c55e;"></i>';
        if(type.includes('CANCELLED')) return '<i class="ph-bold ph-calendar-x" style="color:#ef4444;"></i>';
        if(type.includes('REMINDER')) return '<i class="ph-bold ph-bell-ringing" style="color:#f59e0b;"></i>';
        return '<i class="ph-bold ph-info" style="color:#64748b;"></i>';
    }

    async function fetchPage(page) {
        try {
            const res = await fetch(`/api/notifications?page=${page}&size=${pageSize}`, {
                headers: { Authorization: "Bearer " + token }
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            
            listContainer.innerHTML = '';
            if (data.length === 0 && page === 0) {
                emptyState.style.display = 'block';
                listContainer.style.display = 'none';
                btnPrev.disabled = true;
                btnNext.disabled = true;
                pageInfo.textContent = 'Page 1 of 1';
                return;
            }
            
            emptyState.style.display = 'none';
            listContainer.style.display = 'flex';
            
            data.forEach(n => {
                const div = document.createElement('div');
                div.className = 'notif-item-full ' + (!n.read ? 'unread' : '');
                div.innerHTML = `
                    <div class="notif-icon-box">
                        ${getNotifIconFull(n.type)}
                    </div>
                    <div class="notif-content-full">
                        <div class="notif-title-row">
                            <span class="notif-title">${n.title}</span>
                            <span class="notif-time">${timeAgo(n.timestamp)}</span>
                        </div>
                        <div class="notif-desc">${n.message}</div>
                    </div>
                `;
                div.addEventListener('click', async () => {
                    if (!n.read) {
                        await fetch('/api/notifications/' + n.id + '/read', { method: 'POST', headers: { Authorization: "Bearer " + token } });
                        fetchPage(currentPage);
                    }
                });
                listContainer.appendChild(div);
            });

            hasMore = data.length === pageSize;
            btnPrev.disabled = page === 0;
            btnNext.disabled = !hasMore;
            pageInfo.textContent = `Page ${page + 1}`;
            
        } catch(e) {
            console.error(e);
        }
    }

    btnPrev.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            fetchPage(currentPage);
        }
    });

    btnNext.addEventListener('click', () => {
        if (hasMore) {
            currentPage++;
            fetchPage(currentPage);
        }
    });

    btnMarkAll.addEventListener('click', async () => {
        try {
            await fetch('/api/notifications/read-all', { method: 'POST', headers: { Authorization: "Bearer " + token } });
            fetchPage(currentPage);
        } catch(e) {}
    });

    // Init
    fetchPage(0);
});
