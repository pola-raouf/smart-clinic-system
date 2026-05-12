package org.smartclinic.clinic.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.smartclinic.clinic.Dto.DateScheduleRequestDTO;
import org.smartclinic.clinic.Dto.DoctorScheduleDto;
import org.smartclinic.clinic.service.DoctorScheduleService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class DoctorScheduleController {

    private final DoctorScheduleService scheduleService;

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DoctorScheduleDto>> getDoctorSchedule(@PathVariable Long doctorId) {
        return ResponseEntity.ok(scheduleService.getDoctorSchedule(doctorId));
    }

    @GetMapping("/doctor/{doctorId}/date/{date}")
    public ResponseEntity<List<DoctorScheduleDto>> getDoctorScheduleForDate(
            @PathVariable Long doctorId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(scheduleService.getDoctorScheduleForDate(doctorId, date));
    }

    @PutMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DoctorScheduleDto>> updateDoctorSchedule(
            @PathVariable Long doctorId,
            @RequestBody @Valid DateScheduleRequestDTO request) {
        return ResponseEntity.ok(scheduleService.updateDoctorSchedule(doctorId, request));
    }
}
