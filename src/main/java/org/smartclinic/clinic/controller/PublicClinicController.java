package org.smartclinic.clinic.controller;

import lombok.RequiredArgsConstructor;
import org.smartclinic.clinic.Dto.DoctorResponseDTO;
import org.smartclinic.clinic.Dto.PublicServiceDTO;
import org.smartclinic.clinic.Entity.Doctor;
import org.smartclinic.clinic.Repository.DoctorRepository;
import org.smartclinic.clinic.Repository.PatientRepository;
import org.smartclinic.clinic.service.DoctorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicClinicController {

    private final DoctorService doctorService;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorResponseDTO>> doctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/clinic-summary")
    public ResponseEntity<Map<String, Object>> clinicSummary() {
        long d = doctorRepository.count();
        long p = patientRepository.count();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("doctorCount", d);
        body.put("patientCount", p);
        body.put("doctorLabel", formatCountLabel(d, 50));
        body.put("patientLabel", formatCountLabel(p, 1000));
        return ResponseEntity.ok(body);
    }

    @GetMapping("/services")
    public ResponseEntity<List<Map<String, String>>> services() {
        List<Map<String, String>> result = new java.util.ArrayList<>();
        try {
            List<Doctor> doctors = doctorRepository.findAll();
            for (Doctor d : doctors) {
                String spec = d.getSpecialty();
                if (spec != null && !spec.trim().isEmpty()) {
                    String specKey = spec.toLowerCase().replaceAll("\\s+", "-");
                    boolean exists = result.stream().anyMatch(m -> specKey.equals(m.get("specialtyId")));
                    if (!exists) {
                        Map<String, String> map = new java.util.LinkedHashMap<>();
                        map.put("name", spec);
                        map.put("icon", getIconForSpecialty(specKey));
                        map.put("description", getDescriptionForSpecialty(specKey));
                        map.put("specialtyId", specKey);
                        result.add(map);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Fallback if empty
        if (result.isEmpty()) {
            Map<String, String> map = new java.util.LinkedHashMap<>();
            map.put("name", "General Medicine");
            map.put("icon", "stethoscope");
            map.put("description", "Primary care and preventive visits.");
            map.put("specialtyId", "general-medicine");
            result.add(map);
        }

        return ResponseEntity.ok(result);
    }

    private String getIconForSpecialty(String specKey) {
        return switch (specKey) {
            case "cardiology" -> "heart";
            case "dentistry" -> "tooth";
            case "pediatrics" -> "baby";
            case "general-medicine" -> "stethoscope";
            case "dermatology" -> "sparkle";
            case "orthopedics" -> "bone";
            case "ophthalmology" -> "eye";
            case "gynecology" -> "flower";
            default -> "first-aid"; // generic icon
        };
    }

    private String getDescriptionForSpecialty(String specKey) {
        return switch (specKey) {
            case "cardiology" -> "Heart health, checkups, and follow-up care.";
            case "dentistry" -> "Dental exams, hygiene, and restorative care.";
            case "pediatrics" -> "Care for infants, children, and adolescents.";
            case "general-medicine" -> "Primary care and preventive visits.";
            case "dermatology" -> "Skin, hair, and nail conditions.";
            case "orthopedics" -> "Bones, joints, and musculoskeletal care.";
            case "ophthalmology" -> "Vision and eye health.";
            case "gynecology" -> "Women’s reproductive health.";
            default -> "Specialized medical consultation and treatment."; // generic desc
        };
    }

    private static String formatCountLabel(long n, int threshold) {
        if (n <= 0) {
            return "—";
        }
        if (n >= threshold) {
            if (threshold >= 1000) {
                return (n / 1000) + "k+";
            }
            return threshold + "+";
        }
        return String.valueOf(n);
    }
}
