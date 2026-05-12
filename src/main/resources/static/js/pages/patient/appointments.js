document.addEventListener("DOMContentLoaded", async () => {
    let auth;
    try {
        auth = await import("/js/core/auth.js");
        const pageBoot = await import("/js/core/page-boot.js");
        await pageBoot.bootRoleShell("PATIENT");
    } catch {
        return;
    }

    const $ = (id) => document.getElementById(id);
    const token = auth.getToken();
    const res = await fetch("/api/user/me", {
        headers: { Authorization: "Bearer " + token },
    });

    if (!res.ok) {
        auth.clearAuth();
        window.location.replace("/pages/login.html");
        return;
    }

    const user = await res.json();
    const patientId = String(user.id);

    const tbody = $("appointments-body");
    const emptyState = $("empty-state");

    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;"><i class="ph-bold ph-spinner ph-spin"></i> Loading...</td></tr>`;
    }

    let allAppointments = [];
    try {
        allAppointments = await AppointmentService.getPatientAppointments(patientId);
    } catch (e) {
        console.error("Failed to fetch appointments", e);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: red;">Failed to load appointments</td></tr>`;
        }
        return;
    }

    const searchInput = $("search-input");
    const statusFilter = $("status-filter");
    const clearFilters = $("clear-filters");

    function applyFilters() {
        const query = (searchInput?.value || "").toLowerCase().trim();
        const status = statusFilter?.value || "";

        const filtered = allAppointments.filter((a) => {
            const normalizedStatus = String(a.status || "").toLowerCase();
            if (status && normalizedStatus !== status) return false;
            if (query) {
                const hay = `${a.doctorName || ""} ${a.specialty || ""}`.toLowerCase();
                if (!hay.includes(query)) return false;
            }
            return true;
        });

        renderTable(filtered);
    }

    function renderTable(rows) {
        tbody.innerHTML = "";
        const highlightedId = new URLSearchParams(window.location.search).get("appointmentId");

        if (rows.length === 0) {
            emptyState?.removeAttribute("hidden");
            return;
        }
        emptyState?.setAttribute("hidden", "");

        rows.forEach((a) => {
            const tr = document.createElement("tr");
            tr.dataset.appointmentId = String(a.id || "");
            tr.innerHTML = `
                <td>${formatDate(a.date)}</td>
                <td>${escapeHtml(a.time || "—")}</td>
                <td>${escapeHtml(a.doctorName || "—")}</td>
                <td>${escapeHtml(a.specialty || "—")}</td>
                <td><span class="badge ${escapeAttr(String(a.status || "booked").toLowerCase())}">${labelForStatus(a.status)}</span></td>
                <td><a class="action-link" href="book-appointment.html?id=${encodeURIComponent(a.doctorId)}">Book Again</a></td>
            `;
            tbody.appendChild(tr);

            if (highlightedId && String(a.id) === String(highlightedId)) {
                tr.style.outline = "2px solid var(--primary, #3b82f6)";
                tr.style.background = "rgba(59,130,246,0.08)";
                setTimeout(() => {
                    tr.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 50);
            }
        });
    }

    function updateStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = allAppointments.filter((a) => new Date(a.date) >= today && a.status === "CONFIRMED").length;
        const completed = allAppointments.filter((a) => a.status === "COMPLETED").length;
        const cancelled = allAppointments.filter((a) => a.status === "CANCELLED").length;

        setText("stat-total", allAppointments.length);
        setText("stat-upcoming", upcoming);
        setText("stat-completed", completed);
        setText("stat-cancelled", cancelled);
    }

    searchInput?.addEventListener("input", applyFilters);
    statusFilter?.addEventListener("change", applyFilters);
    clearFilters?.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        if (statusFilter) statusFilter.value = "";
        applyFilters();
    });

    updateStats();
    applyFilters();

    function setText(id, value) {
        const el = $(id);
        if (el) el.textContent = String(value);
    }

    function labelForStatus(status) {
        if (status === "CONFIRMED") return "Confirmed";
        if (status === "COMPLETED") return "Completed";
        if (status === "CANCELLED") return "Cancelled";
        return "Pending";
    }

    function formatDate(iso) {
        if (!iso) return "—";
        const [year, month, day] = iso.split("-").map(Number);
        return new Date(year, month - 1, day).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    function escapeHtml(input) {
        const div = document.createElement("div");
        div.textContent = input;
        return div.innerHTML;
    }

    function escapeAttr(input) {
        return String(input).replace(/[^a-z-]/gi, "");
    }
});
