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
        const res = await fetch("/api/user/me", {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token"),
            },
        });
        if (res.ok) {
            const d = await res.json();
            if (greet) {
                greet.textContent =
                    "Hello, " + (d.name || d.email || "Secretary") + "!";
            }
        }
    } catch {
        /* ignore */
    }

    document.getElementById("btn-logout")?.addEventListener("click", async () => {
        const { logoutUser } = await import("/js/core/auth.js");
        logoutUser();
    });

    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();
});
