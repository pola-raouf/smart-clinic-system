package org.smartclinic.clinic.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.smartclinic.clinic.Entity.Appointment;
import org.smartclinic.clinic.Entity.Doctor;
import org.smartclinic.clinic.Entity.MedicalRecord;
import org.smartclinic.clinic.Entity.Patient;
import org.smartclinic.clinic.Entity.Prescription;
import org.smartclinic.clinic.Entity.User;
import org.smartclinic.clinic.Repository.AppointmentRepository;
import org.smartclinic.clinic.Repository.DoctorRepository;
import org.smartclinic.clinic.Repository.MedicalRecordRepository;
import org.smartclinic.clinic.Repository.PatientRepository;
import org.smartclinic.clinic.Repository.PrescriptionRepository;
import org.smartclinic.clinic.Repository.UserRepository;
import org.smartclinic.clinic.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportExportService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PrescriptionRepository prescriptionRepository;

    @Value("${app.clinic.name:Smart Clinic}")
    private String clinicName;

    @Transactional(readOnly = true)
    public byte[] exportAppointmentReportPdf(String email, Long appointmentId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found."));
        Appointment appt = appointmentRepository.findDetailById(appointmentId)
                .orElseThrow(() -> new ApiException("Appointment not found."));

        boolean allowed = switch (user.getRole()) {
            case DOCTOR -> doctorRepository.findByUserId(user.getId())
                    .map(d -> d.getId().equals(appt.getDoctor().getId()))
                    .orElse(false);
            case PATIENT -> patientRepository.findByUserId(user.getId())
                    .map(p -> p.getId().equals(appt.getPatient().getId()))
                    .orElse(false);
            default -> false;
        };
        if (!allowed) {
            throw new ApiException("Forbidden.");
        }

        MedicalRecord record = medicalRecordRepository
                .findFirstByAppointment_IdOrderByCreatedAtDesc(appointmentId)
                .orElseThrow(() -> new ApiException("No medical record for this appointment."));
        List<Prescription> rx = prescriptionRepository.findByMedicalReportId(record.getId());

        try {
            return buildPdf(appt, record, rx);
        } catch (DocumentException | IOException e) {
            throw new ApiException("Could not generate PDF.");
        }
    }

    private byte[] buildPdf(Appointment appt, MedicalRecord record, List<Prescription> rxList)
            throws DocumentException, IOException {

        Patient patient = appt.getPatient();
        Doctor doctor = appt.getDoctor();

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 48, 48, 48, 48);
            PdfWriter.getInstance(document, baos);
            document.open();

            Paragraph title = new Paragraph(clinicName, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16));
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph("Medical visit report", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Patient: " + dash(patient != null ? patient.getName() : null),
                    FontFactory.getFont(FontFactory.HELVETICA, 11)));
            document.add(new Paragraph("Doctor: " + dash(doctor != null ? doctor.getName() : null),
                    FontFactory.getFont(FontFactory.HELVETICA, 11)));
            if (doctor != null && doctor.getSpecialty() != null) {
                document.add(new Paragraph("Specialty: " + dash(doctor.getSpecialty()),
                        FontFactory.getFont(FontFactory.HELVETICA, 11)));
            }
            document.add(new Paragraph(
                    "Visit date: " + appt.getDate() + "   Time: " + appt.getTime(),
                    FontFactory.getFont(FontFactory.HELVETICA, 11)));
            document.add(new Paragraph(" "));

            addSection(document, "Chief complaint", record.getChiefComplaint());
            addSection(document, "Symptoms", record.getSymptoms());
            addSection(document, "Diagnosis", record.getDiagnosis());
            addSection(document, "Notes", record.getNotes());

            document.add(new Paragraph("Prescription", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11)));
            if (rxList == null || rxList.isEmpty()) {
                document.add(new Phrase("—", FontFactory.getFont(FontFactory.HELVETICA, 10)));
            } else {
                PdfPTable table = new PdfPTable(new float[] { 3f, 2f, 2f, 2f });
                table.setWidthPercentage(100);
                table.addCell("Medication");
                table.addCell("Dosage");
                table.addCell("Frequency");
                table.addCell("Duration");
                for (Prescription p : rxList) {
                    table.addCell(dash(p.getMedicationName()));
                    table.addCell(dash(p.getDosage()));
                    table.addCell(dash(p.getFrequency()));
                    table.addCell(dash(p.getDuration()));
                }
                document.add(table);
            }

            document.close();
            return baos.toByteArray();
        }
    }

    private static void addSection(Document document, String label, String text) throws DocumentException {
        document.add(new Paragraph(label, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11)));
        document.add(new Paragraph(dash(text), FontFactory.getFont(FontFactory.HELVETICA, 10)));
        document.add(new Paragraph(" "));
    }

    private static String dash(String s) {
        return s == null || s.isBlank() ? "—" : s;
    }
}
