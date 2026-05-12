/* ================================================
   bookingService.js  –  Secretary Booking Workflow
   ================================================ */

const BookingService = (() => {
    return {
        async bookAppointment({ doctorId, patientId, date, slotId }) {
            return AppointmentService.book({
                doctorId: Number(doctorId),
                patientId: Number(patientId),
                date,
                time: slotId
            });
        }
    };
})();

window.BookingService = BookingService;
