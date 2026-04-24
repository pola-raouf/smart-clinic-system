/* =========================================
   components.js – LOAD NAVBAR
========================================= */

async function loadNavbar() {
    const res = await fetch('/components/navbar.html');
    const html = await res.text();

    document.getElementById('navbar-container').innerHTML = html;

    await window.initNavbar?.();
    window.initSmartClinicNavbar?.();

    setActiveNavLink();
}

function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop();

    document.querySelectorAll('#nav-links a').forEach(link => {
        link.classList.remove('active');

        const linkPage = link.getAttribute('href').split('/').pop();

        if (currentPage === linkPage) {
            link.classList.add('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', loadNavbar);