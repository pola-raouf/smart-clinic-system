export const NAV_BY_ROLE = {
    PATIENT: [
        { href: "/index.html",                         label: "Home"          },
        { href: "/pages/patient/dashboard.html",     label: "Dashboard"     },
        { href: "/pages/patient/appointments.html",  label: "Appointments"  },
        { href: "/pages/doctors.html",               label: "Doctors"       },
        { href: "/pages/services.html",              label: "Services"      },
        { href: "/pages/patient/reports.html",       label: "Reports"       },
    ],
    DOCTOR: [
        { href: "/index.html",                         label: "Home"          },
        { href: "/pages/doctor/dashboard.html",      label: "Dashboard"     },
        { href: "/pages/doctor/patients.html",       label: "Patients"      },
        { href: "/pages/doctor/appointments.html",   label: "Appointments"  },
        { href: "/pages/doctor/schedule.html",       label: "Schedule"      },
        { href: "/pages/doctor/medical-report.html", label: "Reports"       },
        { href: "/pages/doctor/profile.html",        label: "My profile"    },
    ],
    OWNER: [
        { href: "/index.html",                         label: "Home"          },
        { href: "/pages/owner/dashboard.html",       label: "Dashboard"     },
        { href: "/pages/owner/reports.html",         label: "Reports"       },
        { href: "/pages/owner/users.html",           label: "Users"         },
        { href: "/pages/owner/activity-log.html",    label: "Activity Log"  },
        { href: "/pages/owner/profile.html",         label: "My profile"    },
    ],
    SECRETARY: [
        { href: "/index.html",                         label: "Home"          },
        { href: "/pages/secretary/dashboard.html",            label: "Dashboard"           },
        { href: "/pages/secretary/appointments.html",         label: "Appointments"        },
        { href: "/pages/secretary/manage-appointments.html",  label: "Manage Appointments" },
        { href: "/pages/secretary/manage-schedule.html",      label: "Manage Schedule"     },
        { href: "/pages/secretary/patients.html",             label: "Patients"            },
        { href: "/pages/secretary/profile.html",              label: "My profile"          },
    ],
};

export function guestNavItems() {
    return [
        { href: "/index.html",          label: "Home"     },
        { href: "/pages/doctors.html",  label: "Doctors"  },
        { href: "/pages/services.html", label: "Services" },
    ];
}

export function profilePathForRole(role) {
    const map = {
        PATIENT:   "/pages/patient/profile.html",
        DOCTOR:    "/pages/doctor/profile.html",
        OWNER:     "/pages/owner/profile.html",
        SECRETARY: "/pages/secretary/profile.html",
    };
    return map[role] || "/pages/login.html";
}

export function renderNavLinksList(navLinksEl, items) {
    if (!navLinksEl) return;
    const currentPath = window.location.pathname;

    navLinksEl.innerHTML = items.map((item) => {
        const linkFile = item.href.split("/").pop();
        const isActive =
            currentPath.endsWith(linkFile) ||
            currentPath.endsWith(linkFile + "/") ||
            (linkFile === "index.html" &&
                (currentPath === "/" || currentPath.endsWith("/index.html")));
        return `<li><a href="${item.href}"${isActive ? ' class="active"' : ''}>${item.label}</a></li>`;
    }).join("");
}
