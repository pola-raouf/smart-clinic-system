/* ================================================
   manage-schedule.js  –  Secretary Schedule Management (Date-based)
   ================================================ */

document.addEventListener("DOMContentLoaded", async () => {
    const $ = (id) => document.getElementById(id);

    try {
        const { requireAuth, requireRole } = await import("/js/core/auth.js");
        requireAuth();
        requireRole("SECRETARY");
    } catch {
        return;
    }

    const doctorSelect = $("doctor-select");
    const dateInput = $("schedule-date");
    const scheduleEditor = $("schedule-editor");
    const displayDate = $("display-date");
    const btnAddTime = $("btn-add-time");
    const timeRangesContainer = $("time-ranges-container");
    const emptyState = $("empty-state");
    const btnSave = $("btn-save");
    const loadingOverlay = $("loading-overlay");
    const toast = $("toast");

    const state = {
        doctors: [],
        scheduleDate: "",
        selectedDoctorId: null,
        timeRanges: [],
    };

    function toISODate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    function toSeconds(time) {
        if (!time) return null;
        return time.length === 5 ? `${time}:00` : time;
    }

    function renderEditor() {
        if (!state.selectedDoctorId || !state.scheduleDate) {
            scheduleEditor.setAttribute("hidden", "");
            btnSave.disabled = true;
            return;
        }

        displayDate.textContent = new Date(state.scheduleDate + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
        scheduleEditor.removeAttribute("hidden");
        btnSave.disabled = false;

        timeRangesContainer.innerHTML = "";

        if (state.timeRanges.length === 0) {
            emptyState.removeAttribute("hidden");
        } else {
            emptyState.setAttribute("hidden", "");
            state.timeRanges.forEach((range, index) => {
                const row = document.createElement("div");
                row.className = "time-range-row";
                row.dataset.index = index;
                row.innerHTML = `
                    <div>
                        <div class="tr-label">Start Time</div>
                        <input type="time" class="start-time" value="${(range.startTime || "09:00").substring(0, 5)}">
                    </div>
                    <div>
                        <div class="tr-label">End Time</div>
                        <input type="time" class="end-time" value="${(range.endTime || "17:00").substring(0, 5)}">
                    </div>
                    <button type="button" class="btn-remove-range" title="Remove">
                        <i class="ph-bold ph-trash"></i>
                    </button>
                `;
                row.querySelector(".btn-remove-range").addEventListener("click", () => {
                    state.timeRanges.splice(index, 1);
                    renderEditor();
                });
                row.querySelector(".start-time").addEventListener("change", updateStateFromEditor);
                row.querySelector(".end-time").addEventListener("change", updateStateFromEditor);
                timeRangesContainer.appendChild(row);
            });
        }
    }

    function updateStateFromEditor() {
        const rows = Array.from(timeRangesContainer.querySelectorAll(".time-range-row"));
        state.timeRanges = rows.map((row) => {
            const startTime = toSeconds(row.querySelector(".start-time").value);
            const endTime = toSeconds(row.querySelector(".end-time").value);
            return { startTime, endTime };
        });
    }

    async function loadDoctors() {
        state.doctors = await AppointmentService.getDoctors();
        if (!Array.isArray(state.doctors) || state.doctors.length === 0) {
            throw new Error("No doctors found. Add doctors first, then try again.");
        }
        state.doctors.forEach((doc) => {
            const opt = document.createElement("option");
            opt.value = doc.id;
            opt.textContent = `Dr. ${doc.name} (${doc.specialty})`;
            doctorSelect.appendChild(opt);
        });
    }

    async function loadDoctorSchedule(doctorId, date) {
        state.selectedDoctorId = Number(doctorId);
        state.scheduleDate = date;
        
        try {
            // Updated service call to fetch schedule for a specific date
            const rows = await ScheduleService.getDoctorScheduleForDate(doctorId, date);
            state.timeRanges = (rows || []).map(r => ({
                startTime: r.startTime,
                endTime: r.endTime
            }));
            renderEditor();
        } catch (err) {
            showToast("Could not load schedule for selected date.", true);
            state.timeRanges = [];
            renderEditor();
        }
    }

    async function saveSchedule() {
        updateStateFromEditor();
        
        // Basic validation
        for (const range of state.timeRanges) {
            if (!range.startTime || !range.endTime) {
                showToast("All time ranges must have a start and end time.", true);
                return;
            }
            if (range.startTime >= range.endTime) {
                showToast("End time must be after start time.", true);
                return;
            }
        }

        const payload = {
            doctorId: Number(state.selectedDoctorId),
            scheduleDate: state.scheduleDate,
            timeRanges: state.timeRanges
        };

        const originalText = btnSave.innerHTML;
        btnSave.innerHTML = `<i class="ph-bold ph-spinner ph-spin"></i> Saving...`;
        btnSave.disabled = true;
        showLoading(true);
        try {
            await ScheduleService.saveDoctorDateSchedule(state.selectedDoctorId, payload);
            showToast("Schedule updated successfully.");
        } catch (err) {
            showToast(err.message || "Failed to save schedule.", true);
        } finally {
            showLoading(false);
            btnSave.innerHTML = originalText;
            btnSave.disabled = false;
        }
    }

    function showLoading(show) {
        if (show) loadingOverlay.removeAttribute("hidden");
        else loadingOverlay.setAttribute("hidden", "");
    }

    function showToast(msg, isError = false) {
        toast.textContent = msg;
        toast.className = `toast show ${isError ? "error" : ""}`;
        setTimeout(() => toast.classList.remove("show"), 3000);
    }

    async function init() {
        state.scheduleDate = toISODate(new Date());
        dateInput.value = state.scheduleDate;
        
        showLoading(true);
        try {
            if (typeof AppointmentService === "undefined" || typeof ScheduleService === "undefined") {
                throw new Error("Required services are unavailable. Please refresh the page.");
            }
            await loadDoctors();
        } catch (err) {
            showToast(err.message || "Unable to initialize schedule page.", true);
        } finally {
            showLoading(false);
        }
    }

    doctorSelect.addEventListener("change", async (e) => {
        const val = e.target.value;
        if (!val || !state.scheduleDate) {
            state.selectedDoctorId = null;
            renderEditor();
            return;
        }
        showLoading(true);
        await loadDoctorSchedule(val, state.scheduleDate);
        showLoading(false);
    });

    dateInput.addEventListener("change", async (e) => {
        state.scheduleDate = e.target.value;
        if (!state.selectedDoctorId || !state.scheduleDate) {
            renderEditor();
            return;
        }
        showLoading(true);
        await loadDoctorSchedule(state.selectedDoctorId, state.scheduleDate);
        showLoading(false);
    });

    btnAddTime.addEventListener("click", () => {
        state.timeRanges.push({ startTime: "09:00:00", endTime: "17:00:00" });
        renderEditor();
    });

    btnSave.addEventListener("click", async () => {
        if (!state.selectedDoctorId || !state.scheduleDate) return;
        await saveSchedule();
    });

    const btnCancelEdit = document.getElementById("btn-cancel-edit");
    btnCancelEdit?.addEventListener("click", () => {
        doctorSelect.value = "";
        dateInput.value = toISODate(new Date());
        state.selectedDoctorId = null;
        state.timeRanges = [];
        scheduleEditor.setAttribute("hidden", "");
    });

    init();
});
