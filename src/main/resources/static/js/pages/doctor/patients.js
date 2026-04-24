/* ================================================
   patients.js  –  Doctor My Patients (no auth)
   ================================================ */

document.addEventListener('DOMContentLoaded', async () => {

    try {
        const { bootRoleShell } = await import('/js/core/page-boot.js');
        await bootRoleShell('DOCTOR');
    } catch {
        return;
    }

    const $ = id => document.getElementById(id);

    const ALL_PATIENTS = [
        { id:'P1001', name:'Mohamed Hassan', age:45, gender:'Male',   hue:215, lastVisit:'2026-04-22', lastTime:'09:30 AM' },
        { id:'P1002', name:'Sara Ahmed',     age:32, gender:'Female', hue:340, lastVisit:'2026-04-20', lastTime:'11:00 AM' },
        { id:'P1003', name:'Ahmed Mahmoud',  age:50, gender:'Male',   hue:160, lastVisit:'2026-04-18', lastTime:'04:15 PM' },
        { id:'P1004', name:'Nour El Din',    age:28, gender:'Female', hue:280, lastVisit:'2026-04-16', lastTime:'02:00 PM' },
        { id:'P1005', name:'Omar Khaled',    age:37, gender:'Male',   hue:30,  lastVisit:'2026-04-15', lastTime:'10:45 AM' },
        { id:'P1006', name:'Heba Mostafa',   age:29, gender:'Female', hue:50,  lastVisit:'2026-04-14', lastTime:'03:30 PM' },
        { id:'P1007', name:'Youssef Ali',    age:62, gender:'Male',   hue:190, lastVisit:'2026-04-12', lastTime:'09:00 AM' },
        { id:'P1008', name:'Manar Tarek',    age:35, gender:'Female', hue:260, lastVisit:'2026-04-11', lastTime:'01:30 PM' },
        { id:'P1009', name:'Karim Samir',    age:44, gender:'Male',   hue:80,  lastVisit:'2026-04-10', lastTime:'11:15 AM' },
        { id:'P1010', name:'Dina Hamdy',     age:31, gender:'Female', hue:300, lastVisit:'2026-04-09', lastTime:'04:45 PM' },
        { id:'P1011', name:'Tamer Essam',    age:55, gender:'Male',   hue:130, lastVisit:'2026-04-08', lastTime:'10:00 AM' },
        { id:'P1012', name:'Rania Samy',     age:40, gender:'Female', hue:200, lastVisit:'2026-04-07', lastTime:'12:30 PM' },
        { id:'P1013', name:'Adel Fathy',     age:58, gender:'Male',   hue:20,  lastVisit:'2026-04-06', lastTime:'09:45 AM' },
        { id:'P1014', name:'Nourhan Saber',  age:26, gender:'Female', hue:170, lastVisit:'2026-04-05', lastTime:'03:15 PM' },
        { id:'P1015', name:'Walid Ibrahim',  age:47, gender:'Male',   hue:240, lastVisit:'2026-04-04', lastTime:'11:00 AM' },
        { id:'P1016', name:'Eman Rashad',    age:33, gender:'Female', hue:310, lastVisit:'2026-04-03', lastTime:'02:30 PM' },
        { id:'P1017', name:'Sameh Gohar',    age:51, gender:'Male',   hue:60,  lastVisit:'2026-04-02', lastTime:'10:30 AM' },
        { id:'P1018', name:'Asmaa Wael',     age:38, gender:'Female', hue:180, lastVisit:'2026-04-01', lastTime:'01:00 PM' },
        { id:'P1019', name:'Hossam Nabil',   age:43, gender:'Male',   hue:100, lastVisit:'2026-03-30', lastTime:'09:15 AM' },
        { id:'P1020', name:'Yasmine Fawzy',  age:27, gender:'Female', hue:330, lastVisit:'2026-03-29', lastTime:'04:00 PM' },
        { id:'P1021', name:'Ahmed Gamal',    age:60, gender:'Male',   hue:150, lastVisit:'2026-03-28', lastTime:'11:30 AM' },
        { id:'P1022', name:'Mona Zidan',     age:36, gender:'Female', hue:270, lastVisit:'2026-03-27', lastTime:'03:00 PM' },
        { id:'P1023', name:'Mostafa Kamel',  age:49, gender:'Male',   hue:40,  lastVisit:'2026-03-26', lastTime:'10:15 AM' },
        { id:'P1024', name:'Layla Hassan',   age:30, gender:'Female', hue:210, lastVisit:'2026-03-25', lastTime:'02:45 PM' },
        { id:'P1025', name:'Sherif Adel',    age:53, gender:'Male',   hue:70,  lastVisit:'2026-03-24', lastTime:'09:00 AM' },
        { id:'P1026', name:'Nada Mohsen',    age:24, gender:'Female', hue:290, lastVisit:'2026-03-23', lastTime:'01:45 PM' },
    ];

    const PER_PAGE = 5;
    let currentPage = 1;
    let filtered = [...ALL_PATIENTS];

    setText('pt-count', ALL_PATIENTS.length);
    render();

    $('pt-search')?.addEventListener('input', function () {
        const q = this.value.toLowerCase().trim();
        filtered = ALL_PATIENTS.filter(p =>
            p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
        );
        currentPage = 1; render();
    });

    $('btn-filter')?.addEventListener('click', () => alert('Advanced filters — coming soon.'));

    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();

    function render() {
        const tbody  = $('patients-tbody');
        const pgEl   = $('pagination');
        const infoEl = $('show-info');
        if (!tbody) return;

        const total = filtered.length;
        const pages = Math.max(1, Math.ceil(total / PER_PAGE));
        if (currentPage > pages) currentPage = pages;

        const start = (currentPage - 1) * PER_PAGE;
        const slice = filtered.slice(start, start + PER_PAGE);

        tbody.innerHTML = '';
        if (slice.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--slate-400)">No patients found.</td></tr>`;
        } else {
            slice.forEach(p => {
                const gIco = p.gender === 'Male'
                    ? `<i class="ph-bold ph-gender-male gender-male"></i>`
                    : `<i class="ph-bold ph-gender-female gender-female"></i>`;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><div class="pt-cell">
                        <div class="pt-av" style="--hue:${p.hue}"><i class="ph-fill ph-user"></i></div>
                        <div><div class="pt-name">${p.name}</div><div class="pt-sub">ID: ${p.id}</div></div>
                    </div></td>
                    <td><a href="patient-profile.html?id=${p.id}" class="pt-id-link">${p.id}</a></td>
                    <td>${p.age} yrs, ${p.gender}<br>${gIco}</td>
                    <td>${fmt(p.lastVisit)}<br><span style="font-size:11.5px;color:var(--slate-400)">${p.lastTime}</span></td>
                    <td><a href="patient-details.html?id=${p.id}" class="btn-secondary"><i class="ph-bold ph-eye"></i> View Profile</a></td>`;
                tbody.appendChild(tr);
            });
        }

        if (infoEl) infoEl.textContent = total === 0
            ? 'No patients found'
            : `Showing ${start+1} to ${Math.min(start+PER_PAGE,total)} of ${total} patients`;

        renderPagination(pgEl, pages);
    }

    function renderPagination(el, pages) {
        if (!el) return;
        el.innerHTML = '';
        const prev = pgBtn('<i class="ph-bold ph-caret-left"></i>');
        prev.disabled = currentPage === 1;
        prev.addEventListener('click', () => { currentPage--; render(); });
        el.appendChild(prev);

        pageNums(pages).forEach(p => {
            const btn = pgBtn(p === '…' ? '…' : p);
            if (p === '…') btn.classList.add('ellipsis');
            else {
                if (p === currentPage) btn.classList.add('active');
                btn.addEventListener('click', () => { currentPage = p; render(); });
            }
            el.appendChild(btn);
        });

        const next = pgBtn('<i class="ph-bold ph-caret-right"></i>');
        next.disabled = currentPage === pages;
        next.addEventListener('click', () => { currentPage++; render(); });
        el.appendChild(next);
    }

    function pgBtn(html) {
        const b = document.createElement('button');
        b.className = 'pg-btn'; b.innerHTML = html; return b;
    }

    function pageNums(total) {
        if (total <= 7) return Array.from({length:total},(_,i)=>i+1);
        const p=[1];
        if(currentPage>3) p.push('…');
        for(let i=Math.max(2,currentPage-1);i<=Math.min(total-1,currentPage+1);i++) p.push(i);
        if(currentPage<total-2) p.push('…');
        p.push(total); return p;
    }

    function fmt(iso) {
        if(!iso) return '—';
        const [y,m,d]=iso.split('-').map(Number);
        return new Date(y,m-1,d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    }

    function setText(id,val){ const el=$(id); if(el) el.textContent=val; }
});
