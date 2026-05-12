package org.smartclinic.clinic.service;

import lombok.RequiredArgsConstructor;
import org.smartclinic.clinic.Dto.DateScheduleRequestDTO;
import org.smartclinic.clinic.Dto.DoctorScheduleDto;
import org.smartclinic.clinic.Dto.TimeRangeDTO;
import org.smartclinic.clinic.Entity.Doctor;
import org.smartclinic.clinic.Entity.DoctorSchedule;
import org.smartclinic.clinic.Mapper.DoctorScheduleMapper;
import org.smartclinic.clinic.Repository.DoctorRepository;
import org.smartclinic.clinic.Repository.DoctorScheduleRepository;
import org.smartclinic.clinic.exception.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorScheduleService {

    private final DoctorScheduleRepository scheduleRepository;
    private final DoctorRepository doctorRepository;

    @Transactional(readOnly = true)
    public List<DoctorScheduleDto> getDoctorSchedule(Long doctorId) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new ApiException("Doctor not found with id: " + doctorId);
        }
        return scheduleRepository.findByDoctor_Id(doctorId).stream()
                .map(DoctorScheduleMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DoctorScheduleDto> getDoctorScheduleForDate(Long doctorId, LocalDate date) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new ApiException("Doctor not found with id: " + doctorId);
        }
        return scheduleRepository.findByDoctor_IdAndScheduleDate(doctorId, date).stream()
                .map(DoctorScheduleMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<DoctorScheduleDto> updateDoctorSchedule(Long doctorId, DateScheduleRequestDTO request) {
        // Null-safe comparison to avoid NPE when doctorId or request.getDoctorId() is null
        if (!java.util.Objects.equals(doctorId, request.getDoctorId())) {
            throw new ApiException("Doctor ID in payload does not match path.");
        }

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ApiException("Doctor not found with id: " + doctorId));

        // Treat null timeRanges as empty (clearing the day is valid)
        List<TimeRangeDTO> ranges = request.getTimeRanges() != null
                ? request.getTimeRanges()
                : java.util.Collections.emptyList();

        validateTimeRanges(ranges);

        // Delete existing schedule for this specific date
        // @Modifying(clearAutomatically=true) ensures Hibernate cache is evicted before insert
        scheduleRepository.deleteByDoctor_IdAndScheduleDate(doctorId, request.getScheduleDate());
        // Ensure the delete hits the DB before we insert new rows (avoids unique-constraint conflicts).
        scheduleRepository.flush();

        // If no ranges provided, day is now cleared — return empty list
        if (ranges.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        // Map and save new schedule ranges
        List<DoctorSchedule> newSchedules = ranges.stream()
                .map(range -> toEntity(range, doctor, request.getScheduleDate()))
                .collect(Collectors.toList());

        List<DoctorSchedule> saved = scheduleRepository.saveAll(newSchedules);
        scheduleRepository.flush();

        return saved.stream()
                .map(DoctorScheduleMapper::toDTO)
                .collect(Collectors.toList());
    }

    private void validateTimeRanges(List<TimeRangeDTO> ranges) {
        if (ranges == null || ranges.isEmpty()) {
            return; // Empty means they are clearing the schedule for the day, which is valid.
        }

        for (TimeRangeDTO range : ranges) {
            LocalTime start = range.getStartTime();
            LocalTime end = range.getEndTime();
            
            if (start == null || end == null) {
                throw new ApiException("Start and end time are required for time ranges.");
            }
            if (!end.isAfter(start)) {
                throw new ApiException("End time must be after start time.");
            }
        }
        
        // Optional: Ensure ranges don't overlap within the same day
        ranges.sort((a, b) -> a.getStartTime().compareTo(b.getStartTime()));
        for (int i = 0; i < ranges.size() - 1; i++) {
            if (!ranges.get(i).getEndTime().isBefore(ranges.get(i+1).getStartTime()) && !ranges.get(i).getEndTime().equals(ranges.get(i+1).getStartTime())) {
                throw new ApiException("Overlapping time ranges are not allowed.");
            }
        }
    }

    private DoctorSchedule toEntity(TimeRangeDTO range, Doctor doctor, LocalDate scheduleDate) {
        DoctorSchedule entity = new DoctorSchedule();
        entity.setDoctor(doctor);
        entity.setScheduleDate(scheduleDate);
        entity.setStartTime(range.getStartTime());
        entity.setEndTime(range.getEndTime());
        entity.setDayOff(false);
        return entity;
    }
}
