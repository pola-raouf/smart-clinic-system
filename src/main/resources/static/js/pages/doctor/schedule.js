/* ================================================
   schedule.js  –  Doctor Weekly Schedule
   ================================================ */

document.addEventListener('DOMContentLoaded', async () => {

    try {
        const { bootRoleShell } = await import('/js/core/page-boot.js');
        await bootRoleShell('DOCTOR');
    } catch {
        return;
    }

    const $ = id => document.getElementById(id);

    /* ── Time slots 08:00 AM → 05:00 PM ── */
    const HOURS = [
        '08:00 AM','09:00 AM','10:00 AM','11:00 AM',
        '12:00 PM','01:00 PM','02:00 PM','03:00 PM',
        '04:00 PM','05:00 PM',
    ];

    const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const MONTHS     = ['January','February','March','April','May','June',
                        'July','August','September','October','November','December'];

    const today    = new Date();
    let weekOffset = 0;

    /* ── Mock appointments matching screenshot ── */
    /* dayOffset: 0=Mon,1=Tue,2=Wed,3=Thu,4=Fri */
    const APPTS = [
        // Monday
        { dayOffset:0, hour:'09:00 AM', name:'Mohamed Hassan', time:'09:00 AM – 09:30 AM', status:'confirmed'  },
        { dayOffset:0, hour:'10:00 AM', name:'Sara Ahmed',     time:'10:00 AM – 10:30 AM', status:'pending'    },
        { dayOffset:0, hour:'11:00 AM', name:'Omar Khaled',    time:'11:00 AM – 11:30 AM', status:'confirmed'  },
        { dayOffset:0, hour:'03:00 PM', name:'Nour El Din',    time:'03:00 PM – 03:30 PM', status:'completed'  },
        { dayOffset:0, hour:'04:00 PM', name:'Ahmed Mahmoud',  time:'04:00 PM – 04:30 PM', status:'confirmed'  },
        // Tuesday
        { dayOffset:1, hour:'09:00 AM', name:'Ahmed Tarek',    time:'09:30 AM – 10:00 AM', status:'pending'    },
        { dayOffset:1, hour:'11:00 AM', name:'Heba Mohamed',   time:'11:00 AM – 11:30 AM', status:'pending'    },
        { dayOffset:1, hour:'01:00 PM', name:'Youssef Ali',    time:'01:00 PM – 01:30 PM', status:'pending'    },
        { dayOffset:1, hour:'03:00 PM', name:'Merna Ashraf',   time:'03:00 PM – 03:30 PM', status:'confirmed'  },
        // Wednesday
        { dayOffset:2, hour:'09:00 AM', name:'Khaled Mostafa', time:'09:00 AM – 09:30 AM', status:'confirmed'  },
        { dayOffset:2, hour:'10:00 AM', name:'Mariam Samir',   time:'10:30 AM – 11:00 AM', status:'pending'    },
        { dayOffset:2, hour:'02:00 PM', name:'Ali Samy',       time:'02:00 PM – 02:30 PM', status:'completed'  },
        { dayOffset:2, hour:'04:00 PM', name:'Laila Hassan',   time:'04:00 PM – 04:30 PM', status:'confirmed'  },
        // Thursday
        { dayOffset:3, hour:'09:00 AM', name:'Yara Ahmed',     time:'09:00 AM – 09:30 AM', status:'pending'    },
        { dayOffset:3, hour:'11:00 AM', name:'Islam Fathy',    time:'11:00 AM – 11:30 AM', status:'confirmed'  },
        { dayOffset:3, hour:'02:00 PM', name:'Mostafa Adel',   time:'01:30 PM – 02:00 PM', status:'pending'    },
        { dayOffset:3, hour:'03:00 PM', name:'Marwan Ataf',    time:'03:30 PM – 04:00 PM', status:'completed'  },
        // Friday
        { dayOffset:4, hour:'10:00 AM', name:'Salma Magdy',    time:'10:00 AM – 10:30 AM', status:'confirmed'  },
        { dayOffset:4, hour:'12:00 PM', name:'Hassan Gamal',   time:'12:00 PM – 12:30 PM', status:'pending'    },
        { dayOffset:4, hour:'04:00 PM', name:'Dosa Reda',      time:'04:30 PM – 05:00 PM', status:'confirmed'  },
    ];

    /* ── Get Monday of week ── */
    function getWeekStart(offset) {
        const d   = new Date(today);
        const day = d.getDay();
        const diff = (day === 0 ? -6 : 1 - day);
        d.setDate(d.getDate() + diff + offset * 7);
        d.setHours(0,0,0,0);
        return d;
    }

    /* ── Format date like "May 12" ── */
    function fmtDate(d) {
        return `${MONTHS[d.getMonth()].slice(0,3)} ${d.getDate()}`;
    }

    /* ── Render entire grid ── */
    function render() {
        const weekStart = getWeekStart(weekOffset);
        const weekEnd   = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 4);

        /* Update week label */
        $('week-range-label').textContent =
            `${fmtDate(weekStart)} – ${fmtDate(weekEnd)}, ${weekEnd.getFullYear()}`;

        /* Build Mon–Fri dates */
        const days = [];
        for (let i = 0; i < 5; i++) {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);
            days.push(d);
        }

        /* ── THEAD ── */
        const thead = $('sched-thead');
        thead.innerHTML = '';
        const headRow = document.createElement('tr');

        /* Time header cell */
        const timeTh = document.createElement('th');
        timeTh.textContent = 'Time';
        timeTh.className = 'time-header-cell';
        headRow.appendChild(timeTh);

        days.forEach(d => {
            const isT  = isSameDay(d, today);
            const th   = document.createElement('th');
            th.className = isT ? 'today-col' : '';
            const dayName = DAYS_SHORT[d.getDay()];
            const dateStr = fmtDate(d);
            th.innerHTML = `
                <span class="day-name-label${isT ? ' today-name':''}">${dayName}</span>
                <span class="day-date-label${isT ? ' today-date':''}">${dateStr}</span>`;
            headRow.appendChild(th);
        });
        thead.appendChild(headRow);

        /* ── TBODY ── */
        const tbody = $('sched-tbody');
        tbody.innerHTML = '';

        let totals = { total:0, confirmed:0, pending:0, completed:0 };

        HOURS.forEach(hour => {
            const tr = document.createElement('tr');

            /* Time label */
            const tdTime = document.createElement('td');
            tdTime.className = 'time-label-cell';
            tdTime.textContent = hour;
            tr.appendChild(tdTime);

            /* Day cells */
            days.forEach((d, di) => {
                const isT = isSameDay(d, today);
                const td  = document.createElement('td');
                td.className = `day-cell${isT ? ' today-col' : ''}`;

                const matched = APPTS.filter(a => a.dayOffset === di && a.hour === hour);

                if (matched.length > 0) {
                    matched.forEach(a => {
                        totals.total++;
                        totals[a.status]++;
                        const chip = document.createElement('div');
                        chip.className = `appt-chip ${a.status}`;
                        chip.innerHTML = `
                            <div class="chip-name">${a.name}</div>
                            <div class="chip-time">${a.time}</div>
                            <span class="chip-badge ${a.status}">${cap(a.status)}</span>`;
                        td.appendChild(chip);
                    });
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        /* Update panel stats */
        setText('stat-total',     totals.total);
        setText('stat-confirmed', totals.confirmed);
        setText('stat-pending',   totals.pending);
        setText('stat-completed', totals.completed);
    }

    /* ── Navigation ── */
    $('prev-week')?.addEventListener('click', () => { weekOffset--; render(); });
    $('next-week')?.addEventListener('click', () => { weekOffset++; render(); });
    $('today-btn')?.addEventListener('click', () => { weekOffset = 0; render(); });

    /* ── View toggle ── */
    $('week-view-btn')?.addEventListener('click', () => {
        $('week-view-btn').classList.add('active');
        $('day-view-btn').classList.remove('active');
    });
    $('day-view-btn')?.addEventListener('click', () => {
        $('day-view-btn').classList.add('active');
        $('week-view-btn').classList.remove('active');
    });

    /* ── Hamburger ── */
    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();

    /* ── Helpers ── */
    function isSameDay(a, b) {
        return a.getFullYear() === b.getFullYear() &&
               a.getMonth()    === b.getMonth()    &&
               a.getDate()     === b.getDate();
    }
    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    function setText(id, val) { const el = $(id); if (el) el.textContent = val; }

    render();
});
