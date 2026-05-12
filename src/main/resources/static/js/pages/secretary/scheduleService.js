/* ================================================
   scheduleService.js  –  Schedule API Client
   ================================================ */

const ScheduleService = (() => {
    const API = "/api/schedules";

    async function request(url, options = {}) {
        const token = localStorage.getItem("token");
        const res = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: "Bearer " + token } : {}),
                ...(options.headers || {}),
            },
        });
        if (!res.ok) {
            // Prefer structured API errors: { "message": "..." }
            const cloned = res.clone();
            try {
                const data = await cloned.json();
                const msg =
                    (data && typeof data.message === "string" && data.message.trim()) ||
                    `HTTP ${res.status}`;
                throw new Error(msg);
            } catch {
                const text = await res.text();
                throw new Error(text || `HTTP ${res.status}`);
            }
        }
        return res.status === 204 ? null : res.json();
    }

    return {
        async getDoctorSchedule(doctorId) {
            return request(`${API}/doctor/${doctorId}`);
        },
        async getDoctorScheduleForDate(doctorId, date) {
            return request(`${API}/doctor/${doctorId}/date/${date}`);
        },
        async saveDoctorDateSchedule(doctorId, payload) {
            return request(`${API}/doctor/${doctorId}`, {
                method: "PUT",
                body: JSON.stringify(payload),
            });
        },
    };
})();

window.ScheduleService = ScheduleService;