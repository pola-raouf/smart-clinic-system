/* Secretary dashboard */

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const { bootRoleShell } = await import("/js/core/page-boot.js");
        await bootRoleShell("SECRETARY");
    } catch {
        return;
    }

    const greet = document.getElementById("sec-dash-greeting");
    try {
        const d = await AppointmentService.getCurrentUser();
        if (greet) {
            greet.textContent = "Hello, " + (d.name || d.email || "Secretary") + "!";
        }
        await hydrateDashboardStats();
    } catch {
        /* ignore */
    }

    document.getElementById("btn-logout")?.addEventListener("click", async () => {
        const { logoutUser } = await import("/js/core/auth.js");
        logoutUser();
    });

    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();

    async function hydrateDashboardStats() {
        const doctors = await AppointmentService.getDoctors();
        const allAppointments = await AppointmentService.getAllAppointmentsFromDoctors(doctors);
        const patients = await AppointmentService.getSecretaryPatients();
        const statCards = document.querySelectorAll(".stat-card");
        if (statCards[0]) {
            statCards[0].querySelector("div:nth-child(2)").textContent = String(allAppointments.length);
            statCards[0].querySelector("p").textContent = "Total appointments tracked";
        }
        if (statCards[1]) {
            statCards[1].querySelector("div:nth-child(2)").textContent = String(patients.length);
            statCards[1].querySelector("p").textContent = "Registered patients";
        }
    }
});
