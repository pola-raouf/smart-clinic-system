package org.smartclinic.clinic.Repository;

import org.smartclinic.clinic.Entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatientIdOrderByCreatedAtDesc(Long patientId);//tare5 marady l mared mo3yan
    List<MedicalRecord> findByDoctorId(Long doctorId);//kol takrer aly katbha doctor mo3yan
}
