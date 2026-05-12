/* ================================================
   validationStrategies.js  –  Secretary Validators
   ================================================ */

const ValidationStrategies = (() => {
    const timeRangeStrategy = {
        validate({ startTime, endTime, dayOfWeek }) {
            if (!startTime || !endTime) {
                return `${dayOfWeek}: start and end time are required.`;
            }
            if (endTime <= startTime) {
                return `${dayOfWeek}: end time must be after start time.`;
            }
            return null;
        }
    };

    const dateNotPastStrategy = {
        validate({ date }) {
            if (!date) return "Date is required.";
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selected = new Date(`${date}T00:00:00`);
            if (selected < today) return "Date cannot be in the past.";
            return null;
        }
    };

    return {
        timeRangeStrategy,
        dateNotPastStrategy
    };
})();

window.ValidationStrategies = ValidationStrategies;
