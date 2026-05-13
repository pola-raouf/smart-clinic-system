package org.smartclinic.clinic.Dto;

import lombok.Data;

import java.util.List;

@Data
public class DoctorPatientProfileAggregateDTO {
    private PatientResponseDTO patient;
    private List<AppointmentResponseDTO> appointmentsWithDoctor;
    private List<MedicalRecordResponseDTO> medicalRecords;
    private AppointmentResponseDTO nextAppointment;
}
