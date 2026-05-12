/* =============================================================
   navbar.js  –  Role-aware navbar: loads links, resolves user
   All secretary pages use this via components.js
   ============================================================= */

let _cachedRoleNav = null;

async function _loadRoleNav() {
    if (!_cachedRoleNav) {
        _cachedRoleNav = await import("/js/core/role-nav.js");
    }
    return _cachedRoleNav;
}

window.initNavbar = async function () {
    const { NAV_BY_ROLE, guestNavItems, renderNavLinksList, profilePathForRole } =
        await _loadRoleNav();

    /* ── DOM refs ── */
    const navLinksEl    = document.getElementById("nav-links");
    const navProfile    = document.getElementById("nav-profile");
    const navGuest      = document.getElementById("nav-guest");
    const profileBtn    = document.getElementById("profile-btn");
    const profileDrop   = document.getElementById("profile-dropdown");
    const logoutBtn     = document.getElementById("logout-btn");
    const nameEl        = document.getElementById("nav-user-name");
    const roleEl        = document.getElementById("nav-user-role");
    const profileLink   = document.getElementById("nav-profile-link");

    const token = localStorage.getItem("token");
    const role  = localStorage.getItem("role");

    /* ── STATE: not logged in ── */
    if (!token || !role) {
        navGuest?.removeAttribute("hidden");
        navProfile?.setAttribute("hidden", "");
        renderNavLinksList(navLinksEl, guestNavItems());
        return;
    }

    /* ── STATE: logged in ── */
    navGuest?.setAttribute("hidden", "");
    navProfile?.removeAttribute("hidden");

    // Build nav links for this role
    const items = NAV_BY_ROLE[role];
    if (items) renderNavLinksList(navLinksEl, items);

    // Point "My Profile" dropdown link to the correct role page
    if (profileLink) {
        profileLink.setAttribute("href", profilePathForRole(role));
    }

    // Fetch real user data
    try {
        const res = await fetch("/api/user/me", {
            headers: { Authorization: "Bearer " + token },
        });
        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        const displayName = data.name || data.email || "User";
        if (nameEl) nameEl.textContent = displayName;
        if (roleEl) roleEl.textContent = (data.role || role || "").toUpperCase();
        const img = document.getElementById("nav-profile-avatar-img");
        const fb = document.getElementById("nav-profile-avatar-fallback");
        const parts = String(displayName).trim().split(/\s+/).filter(Boolean);
        const initials =
            parts.length >= 2
                ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                : String(displayName).slice(0, 2).toUpperCase() || "?";
        if (fb) fb.textContent = initials;
        const photo = data.profileImageUrl || data.profilePhotoUrl;
        if (img && photo) {
            img.src = photo.startsWith("http") ? photo : photo;
            img.removeAttribute("hidden");
            if (fb) fb.setAttribute("hidden", "");
        } else if (img) {
            img.setAttribute("hidden", "");
            if (fb) fb.removeAttribute("hidden");
        }
    } catch {
        // Token invalid – clear and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/pages/login.html";
        return;
    }

    /* ── NOTIFICATIONS ── */
    const navNotifWrap = document.getElementById("nav-notifications");
    const notifBtn = document.getElementById("notif-btn");
    const notifBadge = document.getElementById("notif-badge");
    const notifDropdown = document.getElementById("notif-dropdown");
    const notifList = document.getElementById("notif-list");
    const notifMarkAll = document.getElementById("notif-mark-all");
    const notifViewAll = document.getElementById("notif-view-all");

    if (navNotifWrap) {
        navNotifWrap.removeAttribute("hidden");
    }

    if (notifViewAll && role) {
        notifViewAll.href = `/pages/${role.toLowerCase()}/notifications.html`;
    }

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

    function getNotifIcon(type) {
        if(type.includes('BOOKED')) return '<i class="ph-bold ph-calendar-plus" style="color:#3b82f6;"></i>';
        if(type.includes('CONFIRMED')) return '<i class="ph-bold ph-calendar-check" style="color:#22c55e;"></i>';
        if(type.includes('CANCELLED')) return '<i class="ph-bold ph-calendar-x" style="color:#ef4444;"></i>';
        if(type.includes('REMINDER')) return '<i class="ph-bold ph-bell-ringing" style="color:#f59e0b;"></i>';
        return '<i class="ph-bold ph-info" style="color:#64748b;"></i>';
    }

    async function loadNotifications() {
        try {
            const [countRes, listRes] = await Promise.all([
                fetch('/api/notifications/unread-count', { headers: { Authorization: "Bearer " + token } }),
                fetch('/api/notifications?page=0&size=10', { headers: { Authorization: "Bearer " + token } })
            ]);

            if (countRes.ok) {
                const { count } = await countRes.json();
                if (count > 0) {
                    notifBadge.textContent = count > 9 ? '9+' : count;
                    notifBadge.style.display = 'flex';
                } else {
                    notifBadge.style.display = 'none';
                }
            }

            if (listRes.ok) {
                const list = await listRes.json();
                notifList.innerHTML = '';
                if (list.length === 0) {
                    notifList.innerHTML = '<div style="padding:24px; text-align:center; color:var(--slate-400); font-size:13px;">No notifications yet.</div>';
                } else {
                    list.forEach(n => {
                        const item = document.createElement('div');
                        item.style.cssText = `padding:12px 16px; border-bottom:1px solid var(--slate-100); display:flex; gap:12px; cursor:pointer; background:${n.read ? '#fff' : '#f0fdfa'}; transition:background 0.2s;`;
                        item.innerHTML = `
                            <div style="width:36px; height:36px; border-radius:50%; background:var(--slate-50); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                                ${getNotifIcon(n.type)}
                            </div>
                            <div style="flex:1;">
                                <div style="font-size:13px; font-weight:600; color:var(--slate-900); margin-bottom:2px;">${n.title}</div>
                                <div style="font-size:12px; color:var(--slate-600); margin-bottom:4px; line-height:1.4;">${n.message}</div>
                                <div style="font-size:11px; color:var(--slate-400);">${timeAgo(n.timestamp)}</div>
                            </div>
                        `;
                        item.addEventListener('click', async () => {
                            if (!n.read) {
                                await fetch('/api/notifications/' + n.id + '/read', { method: 'POST', headers: { Authorization: "Bearer " + token } });
                                loadNotifications();
                            }
                            // Redirect to appointment logic could go here based on role and relatedAppointmentId
                        });
                        notifList.appendChild(item);
                    });
                }
            }
        } catch(e) {
            console.error('Failed to load notifications', e);
        }
    }

    if (notifMarkAll) {
        notifMarkAll.addEventListener('click', async () => {
            await fetch('/api/notifications/read-all', { method: 'POST', headers: { Authorization: "Bearer " + token } });
            loadNotifications();
        });
    }

    if (token) {
        loadNotifications();
        setInterval(loadNotifications, 60000); // refresh every minute
    }

    /* ── DROPDOWN TOGGLE ── */
    function openDropdown()  {
        profileDrop?.classList.add("show");
        profileBtn?.setAttribute("aria-expanded", "true");
        closeNotifDropdown();
    }
    function closeDropdown() {
        profileDrop?.classList.remove("show");
        profileBtn?.setAttribute("aria-expanded", "false");
    }

    function openNotifDropdown() {
        if(notifDropdown) {
            notifDropdown.style.display = 'flex';
            notifBtn?.setAttribute("aria-expanded", "true");
        }
        closeDropdown();
    }
    function closeNotifDropdown() {
        if(notifDropdown) {
            notifDropdown.style.display = 'none';
            notifBtn?.setAttribute("aria-expanded", "false");
        }
    }

    profileBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        profileDrop?.classList.contains("show") ? closeDropdown() : openDropdown();
    });

    notifBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        (notifDropdown && notifDropdown.style.display === 'flex') ? closeNotifDropdown() : openNotifDropdown();
    });

    document.addEventListener("click", (e) => {
        if (
            profileDrop?.classList.contains("show") &&
            !profileBtn?.contains(e.target) &&
            !profileDrop?.contains(e.target)
        ) {
            closeDropdown();
        }

        if (
            notifDropdown && notifDropdown.style.display === 'flex' &&
            !notifBtn?.contains(e.target) &&
            !notifDropdown?.contains(e.target)
        ) {
            closeNotifDropdown();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeDropdown();
            closeNotifDropdown();
        }
    });

    /* ── LOGOUT ── */
    logoutBtn?.addEventListener("click", async () => {
        try {
            const { logoutUser } = await import("/js/core/auth.js");
            logoutUser();
        } catch {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "/pages/login.html";
        }
    });
};
