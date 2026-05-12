document.addEventListener("DOMContentLoaded", async () => {
    try {
        const { bootRoleShell } = await import("/js/core/page-boot.js");
        await bootRoleShell("SECRETARY");
    } catch {
        return;
    }

    const $ = (id) => document.getElementById(id);
    let pendingCancelId = null;
    let allAppointments = [];
    let doctors = [];

    const tableBody = $("appt-tbody");
    const tableCount = $("table-count");
    const emptyState = $("empty-state");
    const searchInput = $("table-search");
    const statusFilter = $("status-filter");
    const createdFilter = $("created-filter");

    async function loadSecretaryName() {
        try {
            const me = await AppointmentService.getCurrentUser();
            const nameEl = $("sec-username");
            if (nameEl) nameEl.textContent = me.name || "Secretary";
        } catch {
            // Ignore profile load errors on this page.
        }
    }

    function getFilteredAppointments() {
        const query = (searchInput?.value || "").toLowerCase().trim();
        const status = statusFilter?.value || "";
        const createdBy = createdFilter?.value || "";

        return allAppointments
            .filter((a) => {
                const normalizedStatus = String(a.status || "").toLowerCase();
                if (status && toDisplayStatus(normalizedStatus).key !== status) return false;
                if (createdBy) {
                    const marker = a.createdBy || "secretary";
                    if (marker !== createdBy) return false;
                }
                if (!query) return true;
                const haystack = `${a.patientName || ""} ${a.doctorName || ""} ${a.specialty || ""}`.toLowerCase();
                return haystack.includes(query);
            })
            .sort((a, b) => {
                const dateCmp = new Date(`${b.date}T${b.time || "00:00:00"}`) - new Date(`${a.date}T${a.time || "00:00:00"}`);
                if (dateCmp !== 0) return dateCmp;
                return 0;
            });
    }

    function renderStats(all) {
        setText("stat-total", all.length);
        setText("stat-confirmed", all.filter((a) => String(a.status || "").toLowerCase() === "confirmed").length);
        setText("stat-cancelled", all.filter((a) => String(a.status || "").toLowerCase() === "cancelled").length);
    }

    function renderTable() {
        const rows = getFilteredAppointments();
        renderStats(allAppointments);

        if (!tableBody) return;
        tableBody.innerHTML = "";

        if (!rows.length) {
            if (tableCount) tableCount.textContent = "0 appointments";
            emptyState?.removeAttribute("hidden");
            return;
        }

        emptyState?.setAttribute("hidden", "");
        if (tableCount) {
            tableCount.textContent = `${rows.length} appointment${rows.length === 1 ? "" : "s"}`;
        }

        rows.forEach((appt, idx) => {
            const tr = document.createElement("tr");
            const statusMeta = toDisplayStatus(appt.status);
            const statusClass = statusMeta.key;
            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td><strong>${escapeHtml(appt.patientName || "—")}</strong></td>
                <td>${escapeHtml(appt.doctorName || "—")}</td>
                <td>${formatDate(appt.date)}</td>
                <td>${escapeHtml(appt.time || "—")}</td>
                <td><span class="created-by-badge ${appt.createdBy === "secretary" ? "secretary" : ""}">${escapeHtml(appt.createdBy || "secretary")}</span></td>
                <td><span class="status-badge ${escapeAttr(statusClass)}">${escapeHtml(statusMeta.label)}</span></td>
                <td>
                  <button class="btn-cancel-row btn-confirm-row" data-confirm-id="${escapeHtml(appt.id)}" ${statusClass === "pending" ? "" : "disabled"}>
                    Confirm
                  </button>
                  <button class="btn-cancel-row" data-id="${escapeHtml(appt.id)}" ${statusClass === "cancelled" ? "disabled" : ""}>
                    Cancel
                  </button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        tableBody.querySelectorAll(".btn-confirm-row:not(:disabled)").forEach((btn) => {
            btn.addEventListener("click", async () => {
                try {
                    await AppointmentService.confirm(Number(btn.dataset.confirmId));
                    showToast("Appointment confirmed.");
                    await refreshAppointments();
                } catch (err) {
                    showToast(err.message || "Failed to confirm.", true);
                }
            });
        });
        tableBody.querySelectorAll(".btn-cancel-row:not(:disabled)").forEach((btn) => {
            if (btn.dataset.confirmId) return;
            btn.addEventListener("click", () => {
                pendingCancelId = btn.dataset.id;
                $("cancel-overlay")?.removeAttribute("hidden");
            });
        });
    }

    $("clear-filters")?.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        if (statusFilter) statusFilter.value = "";
        if (createdFilter) createdFilter.value = "";
        renderTable();
    });
    searchInput?.addEventListener("input", renderTable);
    statusFilter?.addEventListener("change", renderTable);
    createdFilter?.addEventListener("change", renderTable);

    $("cancel-yes")?.addEventListener("click", () => {
        if (!pendingCancelId) return;
        AppointmentService.cancel(pendingCancelId).then(refreshAppointments).catch((err) => {
            showToast(err.message || "Failed to cancel.", true);
        });
        pendingCancelId = null;
        $("cancel-overlay")?.setAttribute("hidden", "");
        showToast("Appointment cancelled.");
    });

    $("cancel-no")?.addEventListener("click", () => {
        pendingCancelId = null;
        $("cancel-overlay")?.setAttribute("hidden", "");
    });

    $("cancel-overlay")?.addEventListener("click", (e) => {
        if (e.target === $("cancel-overlay")) {
            pendingCancelId = null;
            $("cancel-overlay")?.setAttribute("hidden", "");
        }
    });

    $("btn-logout")?.addEventListener("click", async () => {
        const { logoutUser } = await import("/js/core/auth.js");
        logoutUser();
    });

    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();
    await loadSecretaryName();
    await refreshAppointments();

    function showToast(msg, isError = false) {
        const toast = $("toast");
        const toastMsg = $("toast-msg");
        const toastIcon = $("toast-icon");
        if (!toast) return;
        if (toastMsg) toastMsg.textContent = msg;
        if (toastIcon) toastIcon.className = isError ? "ph-bold ph-x-circle" : "ph-bold ph-check-circle";
        toast.classList.toggle("error", isError);
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3000);
    }

    function setText(id, value) {
        const el = $(id);
        if (el) el.textContent = String(value);
    }

    function formatDate(dateStr) {
        if (!dateStr) return "—";
        const [y, m, d] = dateStr.split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str || "";
        return div.innerHTML;
    }

    function escapeAttr(input) {
        return String(input || "").replace(/[^a-z-]/gi, "");
    }

    function toDisplayStatus(rawStatus) {
        const status = String(rawStatus || "").toLowerCase();
        if (status === "booked" || status === "pending") return { key: "pending", label: "Pending" };
        if (status === "confirmed") return { key: "confirmed", label: "Confirmed" };
        if (status === "completed") return { key: "completed", label: "Completed" };
        if (status === "cancelled") return { key: "cancelled", label: "Cancelled" };
        return { key: "pending", label: "Pending" };
    }

    async function refreshAppointments() {
        try {
            doctors = await AppointmentService.getDoctors();
            allAppointments = await AppointmentService.getAllAppointmentsFromDoctors(doctors);
            renderTable();
        } catch (err) {
            showToast(err.message || "Failed to load appointments.", true);
            allAppointments = [];
            renderTable();
        }
    }
});
