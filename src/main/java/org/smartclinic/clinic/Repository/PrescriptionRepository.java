package org.smartclinic.clinic.Repository;

import org.smartclinic.clinic.Entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByMedicalReportId(Long reportId);// nageb kol al roshtat
}
