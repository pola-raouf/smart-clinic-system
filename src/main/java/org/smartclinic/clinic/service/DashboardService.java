package org.smartclinic.clinic.service;

import org.smartclinic.clinic.Dto.ActivityItemDTO;
import org.smartclinic.clinic.Dto.DashboardStatsDTO;
import org.smartclinic.clinic.Dto.InsightsDTO;
import org.smartclinic.clinic.Dto.TrendPointDTO;
import org.smartclinic.clinic.Entity.AppointmentStatus;
import org.smartclinic.clinic.Entity.MedicalRecord;
import org.smartclinic.clinic.Repository.AppointmentRepository;
import org.smartclinic.clinic.Repository.DoctorRepository;
import org.smartclinic.clinic.Repository.MedicalRecordRepository;
import org.smartclinic.clinic.Repository.PatientRepository;
import org.smartclinic.clinic.util.ClinicLogger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.WeekFields;
import java.util.*;

@Service
public class DashboardService {

    private final ClinicLogger logger = ClinicLogger.getInstance();

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    public DashboardStatsDTO getStats() {
        logger.info("Dashboard stats requested");

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);
        LocalDate prevWeekStart = today.minusDays(13);
        LocalDate prevWeekEnd = today.minusDays(7);

        long totalAppointments = appointmentRepository.count();
        long totalPatients = patientRepository.count();
        long totalDoctors = doctorRepository.count();
        long cancelled = appointmentRepository.countByStatus(AppointmentStatus.CANCELLED);

        long apptThisWeek = appointmentRepository.countByDateBetween(weekStart, today);
        long apptPrevWeek = appointmentRepository.countByDateBetween(prevWeekStart, prevWeekEnd);

        long cancelledThisWeek = appointmentRepository.countByStatusAndDateBetween(
                AppointmentStatus.CANCELLED, weekStart, today);
        long cancelledPrevWeek = appointmentRepository.countByStatusAndDateBetween(
                AppointmentStatus.CANCELLED, prevWeekStart, prevWeekEnd);

        return DashboardStatsDTO.builder()
                .totalAppointments(totalAppointments)
                .totalPatients(totalPatients)
                .totalDoctors(totalDoctors)
                .cancelledAppointments(cancelled)
                .appointmentChangePercent(percentChange(apptPrevWeek, apptThisWeek))
                .patientChangePercent(0.0)
                .doctorChangePercent(0.0)
                .cancelledChangePercent(percentChange(cancelledPrevWeek, cancelledThisWeek))
                .build();
    }

    public List<TrendPointDTO> getAppointmentTrend(String period) {
        logger.info("Appointment trend requested: period=" + period);
        LocalDate today = LocalDate.now();

        if ("daily".equalsIgnoreCase(period)) {
            LocalDate from = today.minusDays(13);
            List<Object[]> rows = appointmentRepository.countGroupedByDate(from, today);
            Map<LocalDate, Long> map = new LinkedHashMap<>();
            for (LocalDate d = from; !d.isAfter(today); d = d.plusDays(1)) {
                map.put(d, 0L);
            }
            for (Object[] row : rows) {
                LocalDate date = (LocalDate) row[0];
                long cnt = ((Number) row[1]).longValue();
                map.put(date, cnt);
            }
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d");
            List<TrendPointDTO> result = new ArrayList<>();
            for (Map.Entry<LocalDate, Long> e : map.entrySet()) {
                result.add(new TrendPointDTO(e.getKey().format(fmt), e.getValue()));
            }
            return result;
        }

        if ("weekly".equalsIgnoreCase(period)) {
            LocalDate from = today.minusWeeks(11);
            List<Object[]> rows = appointmentRepository.countGroupedByWeek(from, today);
            List<TrendPointDTO> result = new ArrayList<>();
            WeekFields wf = WeekFields.ISO;
            for (Object[] row : rows) {
                int yearweek = ((Number) row[0]).intValue();
                int year = yearweek / 100;
                int week = yearweek % 100;
                String label = "W" + week + " " + year;
                long cnt = ((Number) row[1]).longValue();
                result.add(new TrendPointDTO(label, cnt));
            }
            return result;
        }

        LocalDate from = today.withDayOfMonth(1).minusMonths(11);
        List<Object[]> rows = appointmentRepository.countGroupedByMonth(from, today);
        List<TrendPointDTO> result = new ArrayList<>();
        String[] monthNames = {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};
        for (Object[] row : rows) {
            int month = ((Number) row[1]).intValue();
            int year = ((Number) row[0]).intValue();
            String label = monthNames[month - 1] + " " + year;
            long cnt = ((Number) row[2]).longValue();
            result.add(new TrendPointDTO(label, cnt));
        }
        return result;
    }

    public List<TrendPointDTO> getPatientGrowth() {
        logger.info("Patient growth chart requested");
        long total = patientRepository.count();
        if (total == 0) {
            return Collections.emptyList();
        }

        long perMonth = Math.max(1, total / 12);
        String[] monthNames = {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};
        LocalDate today = LocalDate.now();
        List<TrendPointDTO> result = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            LocalDate month = today.minusMonths(i).withDayOfMonth(1);
            long startId = Math.max(1, total - (i + 1) * perMonth) + 1;
            long endId = total - i * perMonth;
            long cnt = patientRepository.countApproxInRange(startId, endId);
            String label = monthNames[month.getMonthValue() - 1] + " " + month.getYear();
            result.add(new TrendPointDTO(label, cnt));
        }
        return result;
    }

    public InsightsDTO getInsights() {
        logger.info("Dashboard insights requested");

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate weekStart = today.minusDays(6);
        LocalDate prevWeekStart = today.minusDays(13);
        LocalDate prevWeekEnd = today.minusDays(7);

        long completedToday = appointmentRepository.countByStatusAndDate(
                AppointmentStatus.COMPLETED, today);
        long completedYesterday = appointmentRepository.countByStatusAndDate(
                AppointmentStatus.COMPLETED, yesterday);

        long totalThisWeek = appointmentRepository.countByDateBetween(weekStart, today);
        long totalPrevWeek = appointmentRepository.countByDateBetween(prevWeekStart, prevWeekEnd);

        long cancelledThisWeek = appointmentRepository.countByStatusAndDateBetween(
                AppointmentStatus.CANCELLED, weekStart, today);

        double cancellationRate = totalThisWeek == 0 ? 0.0
                : Math.round((double) cancelledThisWeek / totalThisWeek * 1000.0) / 10.0;

        long cancelledPrevWeek = appointmentRepository.countByStatusAndDateBetween(
                AppointmentStatus.CANCELLED, prevWeekStart, prevWeekEnd);
        double prevCancellationRate = totalPrevWeek == 0 ? 0.0
                : Math.round((double) cancelledPrevWeek / totalPrevWeek * 1000.0) / 10.0;

        return InsightsDTO.builder()
                .cancellationRate(cancellationRate)
                .cancellationRateChangePercent(cancellationRate - prevCancellationRate)
                .completedToday(completedToday)
                .completedYesterday(completedYesterday)
                .completedTodayChangePercent(percentChange(completedYesterday, completedToday))
                .weeklyAppointments(totalThisWeek)
                .prevWeeklyAppointments(totalPrevWeek)
                .weeklyChangePercent(percentChange(totalPrevWeek, totalThisWeek))
                .build();
    }

    public List<ActivityItemDTO> getRecentActivity(int limit) {
        logger.info("Recent activity feed requested, limit=" + limit);

        List<ActivityItemDTO> feed = new ArrayList<>();

        List<MedicalRecord> records = medicalRecordRepository.findAll();
        records.sort(Comparator.comparing(
                r -> r.getCreatedAt() != null ? r.getCreatedAt() : java.time.LocalDateTime.MIN,
                Comparator.reverseOrder()
        ));

        int recordsToTake = Math.min(limit / 2, records.size());
        for (int i = 0; i < recordsToTake; i++) {
            MedicalRecord r = records.get(i);
            String patientName = r.getPatient() != null ? r.getPatient().getName() : "Unknown";
            String ts = r.getCreatedAt() != null ? r.getCreatedAt().toString() : "";
            feed.add(new ActivityItemDTO(
                    "MEDICAL_RECORD",
                    "Medical record added",
                    "Patient: " + patientName,
                    ts,
                    "purple"
            ));
        }

        var appointments = appointmentRepository.findAll();
        appointments.sort(Comparator.comparing(
                a -> {
                    if (a.getDate() == null) return LocalDate.MIN;
                    return a.getDate();
                },
                Comparator.reverseOrder()
        ));

        int apptToTake = Math.min(limit - recordsToTake, appointments.size());
        for (int i = 0; i < apptToTake; i++) {
            var a = appointments.get(i);
            String patientName = a.getPatient() != null ? a.getPatient().getName() : "Unknown";
            String ts = a.getDate() != null ? a.getDate().atStartOfDay().toString() : "";
            boolean cancelled = AppointmentStatus.CANCELLED.equals(a.getStatus());
            feed.add(new ActivityItemDTO(
                    cancelled ? "APPOINTMENT_CANCELLED" : "APPOINTMENT_BOOKED",
                    cancelled ? "Appointment cancelled" : "Appointment booked",
                    "Patient: " + patientName,
                    ts,
                    cancelled ? "red" : "blue"
            ));
        }

        feed.sort(Comparator.comparing(ActivityItemDTO::getTimestamp, Comparator.reverseOrder()));
        return feed.subList(0, Math.min(limit, feed.size()));
    }

    private double percentChange(long previous, long current) {
        if (previous == 0) return current > 0 ? 100.0 : 0.0;
        return Math.round((double)(current - previous) / previous * 1000.0) / 10.0;
    }
}
