/* ================================================
   secretaryState.js  –  Tiny reactive store
   ================================================ */

const SecretaryState = (() => {
    const state = {
        selectedDoctorId: null
    };
    const listeners = new Set();

    function emit() {
        listeners.forEach((fn) => fn({ ...state }));
    }

    return {
        getState() {
            return { ...state };
        },
        setSelectedDoctorId(doctorId) {
            state.selectedDoctorId = doctorId ? Number(doctorId) : null;
            emit();
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        }
    };
})();

window.SecretaryState = SecretaryState;
