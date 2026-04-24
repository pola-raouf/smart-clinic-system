/* ================================================
   start-consultation.js  –  Doctor Consultation UI
   No auth, no backend — pure frontend interaction
   ================================================ */

document.addEventListener('DOMContentLoaded', async () => {

    try {
        const { requireAuth, requireRole } = await import('/js/core/auth.js');
        requireAuth();
        requireRole('DOCTOR');
    } catch {
        return;
    }

    const $ = id => document.getElementById(id);

    /* ──────────────────────────────────────────
       PATIENT DATA (from URL param or demo)
    ────────────────────────────────────────── */
    const PATIENTS = {
        P1001: { name:'Mohamed Hassan', age:'45 years, Male',  phone:'0123 456 7890', email:'m.hassan@email.com',   location:'Cairo, Egypt', reason:'Regular Checkup'    },
        P1002: { name:'Sara Ahmed',     age:'32 years, Female',phone:'0111 222 3333', email:'sara.ahmed@email.com', location:'Cairo, Egypt', reason:'Chest Pain'         },
        P1003: { name:'Ahmed Mahmoud',  age:'50 years, Male',  phone:'0100 555 6666', email:'ahmed.m@email.com',    location:'Giza, Egypt',  reason:'Follow-up'          },
        P1004: { name:'Nourhan Ali',    age:'28 years, Female',phone:'0122 333 4444', email:'nourhan@email.com',    location:'Alex, Egypt',  reason:'Shortness of Breath'},
        P1005: { name:'Khaled Samy',    age:'60 years, Male',  phone:'0114 567 8901', email:'k.samy@email.com',     location:'Cairo, Egypt', reason:'Heart Disease'      },
        P1006: { name:'Marwan Adel',    age:'50 years, Male',  phone:'0112 345 6789', email:'m.adel@email.com',     location:'Cairo, Egypt', reason:'ECG Review'         },
    };

    const params = new URLSearchParams(window.location.search);
    const ptId   = params.get('patient') || 'P1001';
    const pt     = PATIENTS[ptId] || PATIENTS['P1001'];

    /* Populate sidebar */
    setText('pt-name',     pt.name);
    setText('pt-id',       `ID: ${ptId}`);
    setText('pt-age',      pt.age);
    setText('pt-phone',    pt.phone);
    setText('pt-email',    pt.email);
    setText('pt-location', pt.location);
    setText('appt-reason', pt.reason);

    /* Today's appointment date */
    const dateEl = $('appt-date-line');
    if (dateEl) {
        const now = new Date();
        dateEl.textContent = now.toLocaleDateString('en-US', {
            month:'long', day:'numeric', year:'numeric'
        }) + ' • 09:00 AM';
    }

    /* ──────────────────────────────────────────
       CHAR COUNTERS
    ────────────────────────────────────────── */
    document.querySelectorAll('textarea').forEach(ta => {
        const countEl = document.querySelector(`.char-count[data-target="${ta.id}"]`);
        if (!countEl) return;
        const max = parseInt(countEl.dataset.max, 10);
        ta.addEventListener('input', () => {
            countEl.textContent = `${ta.value.length}/${max}`;
        });
    });

    /* ──────────────────────────────────────────
       DIAGNOSIS TAGS
    ────────────────────────────────────────── */
    const tagsWrap = $('diagnosis-tags');
    const diagInput= $('diagnosis-input');

    /* Pre-load example tags */
    ['Hypertension (I10)','Headache (R51)','Dizziness (R42)'].forEach(addTag);

    $('add-diagnosis-btn')?.addEventListener('click', () => {
        const val = diagInput.value.trim();
        if (!val) return;
        addTag(val);
        diagInput.value = '';
        diagInput.focus();
    });

    diagInput?.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); $('add-diagnosis-btn').click(); }
    });

    function addTag(text) {
        const tag = document.createElement('div');
        tag.className = 'diag-tag';
        tag.innerHTML = `
            <span>${escHtml(text)}</span>
            <button type="button" title="Remove" aria-label="Remove ${escHtml(text)}">
                <i class="ph-bold ph-x"></i>
            </button>`;
        tag.querySelector('button').addEventListener('click', () => tag.remove());
        tagsWrap?.appendChild(tag);
    }

    /* ──────────────────────────────────────────
       MEDICATIONS
    ────────────────────────────────────────── */
    const DOSE_OPTS = ['5 mg','10 mg','25 mg','50 mg','100 mg','250 mg','500 mg','1000 mg'];
    const FREQ_OPTS = ['Once daily','Twice daily','Three times daily','When needed','Every 8 hrs','Every 12 hrs'];
    const DUR_OPTS  = ['3 days','5 days','7 days','10 days','14 days','30 days','Ongoing'];

    const DEFAULT_MEDS = [
        { name:'Amlodipine 5mg Tablet',  sub:'1 Tablet', dose:'5 mg',   freq:'Once daily',  dur:'30 days' },
        { name:'Losartan 50mg Tablet',   sub:'1 Tablet', dose:'50 mg',  freq:'Once daily',  dur:'30 days' },
        { name:'Paracetamol 500mg Tablet',sub:'1 Tablet',dose:'500 mg', freq:'When needed', dur:'5 days'  },
    ];

    const medTbody = $('med-tbody');
    DEFAULT_MEDS.forEach(m => addMedRow(m));

    $('add-med-btn')?.addEventListener('click', () => addMedRow());

    function addMedRow(data = {}) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="med-name" contenteditable="true" spellcheck="false">${escHtml(data.name || 'New Medication')}</div>
                <div class="med-sub">${escHtml(data.sub || '1 Tablet')}</div>
            </td>
            <td>${buildSelect(DOSE_OPTS, data.dose || '10 mg')}</td>
            <td>${buildSelect(FREQ_OPTS, data.freq || 'Once daily')}</td>
            <td>${buildSelect(DUR_OPTS,  data.dur  || '7 days')}</td>
            <td>
                <button class="btn-del-med" title="Remove medication">
                    <i class="ph-bold ph-trash"></i>
                </button>
            </td>
        `;
        tr.querySelector('.btn-del-med').addEventListener('click', () => {
            if (medTbody.rows.length > 1) {
                tr.remove();
            } else {
                showToast('At least one medication is required.', true);
            }
        });
        medTbody?.appendChild(tr);
        /* Scroll into view for new rows */
        if (!data.name) tr.scrollIntoView({ behavior:'smooth', block:'nearest' });
    }

    function buildSelect(options, selected) {
        const opts = options.map(o =>
            `<option value="${o}" ${o === selected ? 'selected' : ''}>${o}</option>`
        ).join('');
        return `<select class="med-select">${opts}</select>`;
    }

    /* Medication search filter */
    $('med-search')?.addEventListener('input', function () {
        const q = this.value.toLowerCase().trim();
        medTbody?.querySelectorAll('tr').forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
    });

    /* ──────────────────────────────────────────
       FILE UPLOAD
    ────────────────────────────────────────── */
    const uploadArea  = $('upload-area');
    const fileInput   = $('file-input');
    const fileList    = $('uploaded-files');

    fileInput?.addEventListener('change', () => handleFiles(fileInput.files));

    uploadArea?.addEventListener('dragover', e => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    uploadArea?.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea?.addEventListener('drop', e => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (file.size > 10 * 1024 * 1024) {
                showToast(`${file.name} exceeds 10MB limit.`, true); return;
            }
            const li = document.createElement('li');
            li.innerHTML = `
                <i class="ph-bold ph-file-text"></i>
                <span>${escHtml(file.name)} <small style="color:var(--slate-400)">(${(file.size/1024).toFixed(1)} KB)</small></span>
                <button title="Remove file"><i class="ph-bold ph-x"></i></button>
            `;
            li.querySelector('button').addEventListener('click', () => li.remove());
            fileList?.appendChild(li);
        });
    }

    /* ──────────────────────────────────────────
       SAVE & FINISH
    ────────────────────────────────────────── */
    $('btn-finish')?.addEventListener('click', () => {
        const chief = $('chief-complaint')?.value.trim();
        if (!chief) {
            showToast('Please enter the chief complaint.', true);
            $('chief-complaint')?.focus();
            return;
        }
        showToast('Consultation saved successfully!');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 1800);
    });

    $('btn-records')?.addEventListener('click', () => {
        showToast('Patient records feature coming soon.');
    });

    /* ──────────────────────────────────────────
       SIDEBAR NAV — active state
    ────────────────────────────────────────── */
    document.querySelectorAll('.snav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.snav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    /* ──────────────────────────────────────────
       HELPERS
    ────────────────────────────────────────── */
    function showToast(msg, isError = false) {
        const t   = $('toast');
        const msg_= $('toast-msg');
        const ico = t?.querySelector('i');
        if (!t) return;
        if (msg_) msg_.textContent = msg;
        if (ico)  ico.style.color  = isError ? '#f87171' : 'var(--green-600)';
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3000);
    }

    function setText(id, val) {
        const el = $(id);
        if (el) el.textContent = val;
    }

    function escHtml(str) {
        const el = document.createElement('div');
        el.textContent = str || '';
        return el.innerHTML;
    }
});
