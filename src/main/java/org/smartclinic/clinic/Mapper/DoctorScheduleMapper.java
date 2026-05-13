package org.smartclinic.clinic.Mapper;

import org.smartclinic.clinic.Dto.DoctorScheduleDto;
import org.smartclinic.clinic.Entity.Doctor;
import org.smartclinic.clinic.Entity.DoctorSchedule;

public class DoctorScheduleMapper {

    public static DoctorScheduleDto toDTO(DoctorSchedule entity) {
        if (entity == null) return null;
        DoctorScheduleDto dto = new DoctorScheduleDto();
        dto.setId(entity.getId());
        dto.setDoctorId(entity.getDoctor().getId());
        dto.setScheduleDate(entity.getScheduleDate());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        return dto;
    }

    public static DoctorSchedule toEntity(DoctorScheduleDto dto, Doctor doctor) {
        if (dto == null) return null;
        DoctorSchedule entity = new DoctorSchedule();
        entity.setId(dto.getId()); // will be ignored if null on save
        entity.setDoctor(doctor);
        entity.setScheduleDate(dto.getScheduleDate());
        entity.setStartTime(dto.getStartTime());
        entity.setEndTime(dto.getEndTime());
        entity.setDayOff(false);
        return entity;
    }
}
