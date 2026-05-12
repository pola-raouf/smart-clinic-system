/* ================================================
   appointmentService.js  –  Shared Appointment Service
   ================================================ */

/**
 * @typedef {Object} Doctor
 * @property {number} id
 * @property {string} name
 * @property {string} specialty
 * @property {number=} userId
 */

/**
 * @typedef {Object} Patient
 * @property {number} id
 * @property {string} name
 * @property {string=} email
 * @property {string=} phoneNumber
 * @property {string=} gender
 * @property {string=} dateOfBirth
 * @property {string=} address
 */

/**
 * @typedef {Object} Schedule
 * @property {number} doctorId
 * @property {string} weekStartDate
 * @property {Array<{dayOfWeek:string,startTime:string|null,endTime:string|null,isDayOff:boolean}>} dailySchedules
 */

/**
 * @typedef {Object} Appointment
 * @property {number} id
 * @property {number} doctorId
 * @property {string=} doctorName
 * @property {string=} specialty
 * @property {number} patientId
 * @property {string=} patientName
 * @property {string} date
 * @property {string} time
 * @property {string} status
 */

const AppointmentService = (() => {
  const API = "/api/appointments";

  function getHeaders() {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = "Bearer " + token;
    }
    return headers;
  }

  async function toError(res) {
    const payload = await res.json().catch(() => ({}));
    const fallbackByStatus = {
      400: "Invalid request data.",
      401: "Your session expired. Please log in again.",
      403: "You are not allowed to perform this action.",
      404: "Requested resource was not found.",
      409: "This slot is already booked.",
      500: "Server error. Please try again later.",
    };
    const message =
      payload.message || fallbackByStatus[res.status] || "Request failed";
    const error = new Error(message);
    error.status = res.status;
    return error;
  }

  async function handleResponse(res) {
    if (!res.ok) {
      throw await toError(res);
    }
    if (res.status === 204) {
      return null;
    }
    return res.json().catch(() => null);
  }

  async function fetchData(url, options = {}) {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {}),
      },
    });
    return handleResponse(res);
  }

  return {
    fetchData,

    /* ─── Doctors ─── */
    /** @returns {Promise<Doctor[]>} */
    async getDoctors() {
      return fetchData("/api/doctor");
    },

    /** @returns {Promise<Doctor>} */
    async getDoctorById(id) {
      return fetchData(`/api/doctor/${id}`);
    },

    async getCurrentUser() {
      return fetchData("/api/user/me");
    },

    /* ─── Secretary Patients ─── */
    /** @returns {Promise<Patient[]>} */
    async getSecretaryPatients() {
      return fetchData("/api/secretary/patients");
    },

    /** @returns {Promise<Patient>} */
    async createSecretaryPatient(data) {
      return fetchData("/api/secretary/patients", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    /** @returns {Promise<Patient>} */
    async updateSecretaryPatient(id, data) {
      return fetchData(`/api/secretary/patients/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    async deleteSecretaryPatient(id) {
      return fetchData(`/api/secretary/patients/${id}`, {
        method: "DELETE",
      });
    },

    /* ─── Appointments API ─── */

    async book(data) {
      return fetchData(API, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async confirm(id) {
      const apptId = Number(id);
      return fetchData(`${API}/${apptId}/confirm`, {
        method: "PATCH",
      });
    },

    async cancel(id) {
      return fetchData(`${API}/${id}/cancel`, {
        method: "PATCH",
      });
    },

    async complete(id) {
      return fetchData(`${API}/${id}/complete`, {
        method: "PATCH",
      });
    },

    async getDoctorAvailability(doctorId, date) {
      return fetchData(`${API}/doctor/${doctorId}/availability?date=${date}`);
    },

    async getPatientAppointments(patientId) {
      return fetchData(`${API}/patient/${patientId}`);
    },

    async getDoctorAppointments(doctorId) {
      return fetchData(`${API}/doctor/${doctorId}`);
    },

    /** @returns {Promise<Array<{ patient: Object, age?: number, lastVisitDate: string, lastVisitTime: string, appointmentCount: number }>>} */
    async getDoctorMyPatients() {
      return fetchData("/api/doctor/me/patients");
    },

    async getDoctorPatientProfile(patientId) {
      return fetchData(`/api/doctor/me/patient/${Number(patientId)}/profile`);
    },

    /** @returns {Promise<Array<{ id?: number, doctorId: number, scheduleDate: string, startTime: string, endTime: string }>>} */
    async getDoctorMyScheduleForDate(isoDate) {
      return fetchData(`/api/doctor/me/schedule/${isoDate}`);
    },

    async getDoctorMedicalRecords() {
      return fetchData("/api/doctor/me/medical-records");
    },

    /* ─── Consultation (Doctor-only) ─── */

    /** Add Diagnosis – creates a MedicalRecord. */
    async addDiagnosis(dto) {
      return fetchData("/api/doctor/me/diagnoses", {
        method: "POST",
        body: JSON.stringify(dto),
      });
    },

    /** Add Prescription – attaches a Prescription to an existing MedicalRecord. */
    async addPrescription(dto) {
      return fetchData("/api/doctor/me/prescriptions", {
        method: "POST",
        body: JSON.stringify(dto),
      });
    },

    /** View Medical History – combined diagnoses + prescriptions for a patient. */
    async getDoctorPatientHistory(patientId) {
      return fetchData(`/api/doctor/me/patient/${Number(patientId)}/history`);
    },

    async getPatientMedicalReports() {
      return fetchData("/api/patient/me/medical-reports");
    },

    async getPatientMedicalReportByAppointment(appointmentId) {
      return fetchData(
        `/api/patient/me/medical-reports/appointment/${Number(appointmentId)}`,
      );
    },

    /** Opens a PDF download for a completed visit (doctor or patient JWT). */
    async downloadReportPdf(appointmentId) {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/reports/${Number(appointmentId)}/export`, {
        headers: token ? { Authorization: "Bearer " + token } : {},
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Could not download PDF.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `visit-report-${appointmentId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    },

    async getPublicDoctors() {
      const res = await fetch("/api/public/doctors");
      if (!res.ok) throw new Error("Could not load doctors");
      return res.json();
    },

    async getPublicClinicSummary() {
      const res = await fetch("/api/public/clinic-summary");
      if (!res.ok) throw new Error("Could not load summary");
      return res.json();
    },

    async getPublicServices() {
      const res = await fetch("/api/public/services");
      if (!res.ok) throw new Error("Could not load services");
      return res.json();
    },

    async getAllAppointmentsFromDoctors(doctors) {
      const lists = await Promise.all(
        (doctors || []).map((doc) =>
          this.getDoctorAppointments(doc.id).catch(() => []),
        ),
      );
      const dedup = new Map();
      lists.flat().forEach((appt) => dedup.set(String(appt.id), appt));
      return Array.from(dedup.values());
    },
  };
})();

window.AppointmentService = AppointmentService;
