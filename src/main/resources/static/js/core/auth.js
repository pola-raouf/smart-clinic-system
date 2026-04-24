const LOGIN_PAGE = "/pages/login.html";

export function getToken() {
    return localStorage.getItem("token");
}

export function getRole() {
    return localStorage.getItem("role");
}

export function clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
}

export function requireAuth() {
    if (!getToken()) {
        window.location.replace(LOGIN_PAGE);
        throw new Error("Unauthorized");
    }
}

export function requireRole(role) {
    requireAuth();
    if (getRole() !== role) {
        window.location.replace(LOGIN_PAGE);
        throw new Error("Forbidden");
    }
}

export const ROLE_HOME_PAGES = {
    PATIENT: "/pages/patient/dashboard.html",
    DOCTOR: "/pages/doctor/dashboard.html",
    OWNER: "/pages/owner/dashboard.html",
    SECRETARY: "/pages/secretary/dashboard.html",
};

export async function authFetch(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    const token = getToken();
    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }
    return fetch(path, { ...options, headers });
}

export function logoutUser() {
    clearAuth();
    window.location.href = LOGIN_PAGE;
}
