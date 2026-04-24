/* ================================================
   appointmentService.js  –  Shared Appointment Service
   localStorage as database — swap for fetch() calls later
   ================================================ */

const AppointmentService = (() => {

    const STORAGE_KEY = 'sc_appointments';

    /* ─── Static doctor list (replace with API call) ─── */
    const DOCTORS = [
        { id: 1,  name: 'Dr. Ahmed Ali',    specialty: 'Cardiologist',       exp: '10+ Years', hue: 215 },
        { id: 2,  name: 'Dr. Sara Hassan',  specialty: 'Dentist',            exp: '8+ Years',  hue: 160 },
        { id: 3,  name: 'Dr. Mohamed Said', specialty: 'General Physician',  exp: '7+ Years',  hue: 200 },
        { id: 4,  name: 'Dr. Dina Ahmed',   specialty: 'Pediatrician',       exp: '9+ Years',  hue: 340 },
        { id: 5,  name: 'Dr. Karim Mostafa',specialty: 'Orthopedic Surgeon', exp: '12+ Years', hue: 30  },
        { id: 6,  name: 'Dr. Nour El Din',  specialty: 'Dermatologist',      exp: '6+ Years',  hue: 280 },
        { id: 7,  name: 'Dr. Tamer Salah',  specialty: 'Neurologist',        exp: '11+ Years', hue: 50  },
        { id: 8,  name: 'Dr. Reem Essam',   specialty: 'Gynecologist',       exp: '10+ Years', hue: 190 },
    ];

    /* ─── Time slot list ─── */
    const TIME_SLOTS = [
        '09:00 AM','09:30 AM','10:00 AM',
        '10:30 AM','11:00 AM','11:30 AM',
        '12:00 PM','12:30 PM','01:00 PM',
        '02:00 PM','02:30 PM','03:00 PM',
        '03:30 PM','04:00 PM','04:30 PM',
        '05:00 PM','05:30 PM','06:00 PM',
    ];

    /* ─── Helpers ─── */
    function generateId() {
        return 'appt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    }

    return {

        /* ─── Doctors ─── */
        getDoctors() { return [...DOCTORS]; },

        getDoctorById(id) {
            return DOCTORS.find(d => d.id === Number(id)) || null;
        },

        getTimeSlots() { return [...TIME_SLOTS]; },

        /* ─── Appointments CRUD ─── */

        /** @returns {object[]} */
        getAll() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            } catch { return []; }
        },

        /** @returns {object|undefined} */
        getById(id) {
            return this.getAll().find(a => a.id === id);
        },

        /**
         * Book a new appointment
         * @param {{
         *   doctorId, doctorName, specialty,
         *   patientId, patientName,
         *   date, time,
         *   createdBy: 'patient'|'secretary'
         * }} data
         * @returns {object} saved appointment
         */
        book(data) {
            if (this.isSlotTaken(data.doctorId, data.date, data.time)) {
                throw new Error('This time slot is already booked.');
            }
            const appointment = {
                id:        generateId(),
                status:    'confirmed',
                createdAt: new Date().toISOString(),
                ...data,
            };
            const all = this.getAll();
            all.push(appointment);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
            return appointment;
        },

        /**
         * Cancel (soft-delete) an appointment
         * @param {string} id
         */
        cancel(id) {
            const all = this.getAll().map(a =>
                a.id === id ? { ...a, status: 'cancelled' } : a
            );
            localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        },

        /**
         * Hard-delete an appointment
         * @param {string} id
         */
        delete(id) {
            const all = this.getAll().filter(a => a.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        },

        /**
         * Update an existing appointment
         * @param {string} id
         * @param {object} updates
         * @returns {object|null}
         */
        update(id, updates) {
            const all = this.getAll();
            const idx = all.findIndex(a => a.id === id);
            if (idx === -1) return null;
            all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
            return all[idx];
        },

        /**
         * Check whether a slot is already booked
         * @param {number|string} doctorId
         * @param {string} date  'YYYY-MM-DD'
         * @param {string} time  '09:00 AM'
         */
        isSlotTaken(doctorId, date, time) {
            return this.getAll().some(a =>
                Number(a.doctorId) === Number(doctorId) &&
                a.date   === date &&
                a.time   === time &&
                a.status !== 'cancelled'
            );
        },

        /**
         * Get all booked time-strings for a doctor on a date
         * @returns {string[]}
         */
        getBookedSlots(doctorId, date) {
            return this.getAll()
                .filter(a =>
                    Number(a.doctorId) === Number(doctorId) &&
                    a.date === date &&
                    a.status !== 'cancelled'
                )
                .map(a => a.time);
        },

        /** Filter appointments by patient */
        getForPatient(patientId) {
            return this.getAll().filter(a => a.patientId === patientId);
        },

        /** Filter appointments by doctor */
        getForDoctor(doctorId) {
            return this.getAll().filter(a => Number(a.doctorId) === Number(doctorId));
        },
    };

})();

window.AppointmentService = AppointmentService;
