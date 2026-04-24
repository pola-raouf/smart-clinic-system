package org.smartclinic.clinic.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prescriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String medicationName;
    private String dosage;
    private String frequency;
    private String duration;
    @ManyToOne
    @JoinColumn(name = "report_id", nullable = false)
    private MedicalRecord medicalReport;
}