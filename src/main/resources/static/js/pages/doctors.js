/* ================================================
   doctors.js  –  Smart Clinic Doctors Page
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

    const $        = id => document.getElementById(id);
    const searchEl = $('search-input');
    const specEl   = $('spec-filter');
    const grid     = $('doctors-grid');
    const emptyEl  = $('empty-state');
    const resetBtn = $('reset-filter');

    const allCards = Array.from(grid?.querySelectorAll('.doctor-card') || []);

    /* ─────────────────────────────────────────
       1. LIVE SEARCH + FILTER
    ───────────────────────────────────────── */
    function filterCards() {
        const query    = (searchEl?.value || '').toLowerCase().trim();
        const spec     = (specEl?.value  || '').toLowerCase();
        let   visible  = 0;

        allCards.forEach(card => {
            const nameMatch = !query || (card.dataset.name || '').includes(query);
            const specMatch = !spec  || card.dataset.spec === spec;
            const show      = nameMatch && specMatch;
            card.style.display = show ? '' : 'none';
            if (show) visible++;
        });

        /* Toggle empty state */
        if (emptyEl) emptyEl.classList.toggle('show', visible === 0);
    }

    searchEl?.addEventListener('input',  filterCards);
    specEl?.addEventListener('change',   filterCards);

    resetBtn?.addEventListener('click', () => {
        if (searchEl) searchEl.value = '';
        if (specEl)   specEl.value   = '';
        filterCards();
    });

    /* ─────────────────────────────────────────
       2. PAGINATION (visual only)
    ───────────────────────────────────────── */
    const pageBtns   = Array.from(document.querySelectorAll('.page-btn[data-page]'));
    const prevBtn    = $('prev-btn');
    const nextBtn    = $('next-btn');
    let   activePage = 1;
    const totalPages = 3;

    function setPage(page) {
        activePage = Math.max(1, Math.min(page, totalPages));

        pageBtns.forEach(btn => {
            const p = parseInt(btn.dataset.page);
            btn.classList.toggle('active', p === activePage);
            btn.setAttribute('aria-current', p === activePage ? 'page' : 'false');
        });

        if (prevBtn) prevBtn.disabled = activePage === 1;
        if (nextBtn) nextBtn.disabled = activePage === totalPages;

        document.getElementById('doctors-section')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    pageBtns.forEach(btn => btn.addEventListener('click', () => setPage(parseInt(btn.dataset.page))));
    prevBtn?.addEventListener('click', () => setPage(activePage - 1));
    nextBtn?.addEventListener('click', () => setPage(activePage + 1));
    setPage(1);

    /* ─────────────────────────────────────────
       3. MOBILE HAMBURGER MENU
    ───────────────────────────────────────── */
    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();

});
