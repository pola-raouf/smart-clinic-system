export const NAV_BY_ROLE = {
    PATIENT: [
        { href: "/pages/patient/dashboard.html", label: "Dashboard" },
        { href: "/pages/patient/appointments.html", label: "Appointments" },
        { href: "/pages/patient/reports.html", label: "Reports" },
        { href: "/pages/patient/profile.html", label: "Profile" },
    ],
    DOCTOR: [
        { href: "/pages/doctor/dashboard.html", label: "Dashboard" },
        { href: "/pages/doctor/patients.html", label: "Patients" },
        { href: "/pages/doctor/schedule.html", label: "Schedule" },
        { href: "/pages/doctor/medical-report.html", label: "Reports" },
        { href: "/pages/doctor/profile.html", label: "Profile" },
    ],
    OWNER: [
        { href: "/pages/owner/dashboard.html", label: "Dashboard" },
        { href: "/pages/owner/reports.html", label: "Reports" },
        { href: "/pages/owner/users.html", label: "Users" },
        { href: "/pages/owner/profile.html", label: "Profile" },
    ],
    SECRETARY: [
        { href: "/pages/secretary/dashboard.html", label: "Dashboard" },
        { href: "/pages/secretary/appointments.html", label: "Appointments" },
        { href: "/pages/secretary/manage-appointments.html", label: "Manage Appointments" },
        { href: "/pages/secretary/patients.html", label: "Patients" },
        { href: "/pages/secretary/profile.html", label: "Profile" },
    ],
};

export function guestNavItems() {
    return [
        { href: "/index.html", label: "Home" },
        { href: "/pages/doctors.html", label: "Doctors" },
        { href: "/pages/services.html", label: "Services" },
    ];
}

export function profilePathForRole(role) {
    const map = {
        PATIENT: "/pages/patient/profile.html",
        DOCTOR: "/pages/doctor/profile.html",
        OWNER: "/pages/owner/profile.html",
        SECRETARY: "/pages/secretary/profile.html",
    };
    return map[role] || "/pages/login.html";
}

export function renderNavLinksList(navLinksEl, items) {
    if (!navLinksEl) return;
    navLinksEl.innerHTML = items
        .map(
            (item) =>
                `<li><a href="${item.href}">${item.label}</a></li>`
        )
        .join("");
}
