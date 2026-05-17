package org.smartclinic.clinic.service;

import lombok.RequiredArgsConstructor;
import org.smartclinic.clinic.Entity.Appointment;
import org.smartclinic.clinic.Entity.AppointmentStatus;
import org.smartclinic.clinic.Entity.Notification;
import org.smartclinic.clinic.Entity.User;
import org.smartclinic.clinic.Repository.AppointmentRepository;
import org.smartclinic.clinic.Repository.NotificationRepository;
import org.smartclinic.clinic.util.ClinicLogger;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReminderScheduler {

    private final AppointmentRepository appointmentRepository;
    private final NotificationRepository notificationRepository;
    private final ClinicLogger logger = ClinicLogger.getInstance();
    
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("hh:mm a");

    
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void scheduleReminders() {
        logger.info("Running reminder scheduler task");
        
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();
        LocalDate tomorrow = today.plusDays(1);
        
        List<AppointmentStatus> activeStatuses = Arrays.asList(AppointmentStatus.BOOKED, AppointmentStatus.CONFIRMED);
        
        
        List<Appointment> tomorrowAppts = appointmentRepository.findByDateAndStatusIn(tomorrow, activeStatuses);
        for (Appointment appt : tomorrowAppts) {
            String type = "REMINDER_24H";
            if (!notificationRepository.existsByRelatedAppointmentIdAndNotificationType(appt.getId(), type)) {
                sendReminder(appt, type, "Reminder: You have an upcoming appointment tomorrow at " + appt.getTime().format(TIME_FMT) + ".");
            }
        }
        
        
        List<Appointment> todayAppts = appointmentRepository.findByDateAndStatusIn(today, activeStatuses);
        LocalTime timeNow = now.toLocalTime();
        LocalTime timeInOneHour = timeNow.plusHours(1).plusMinutes(5); 
        
        for (Appointment appt : todayAppts) {
            if (appt.getTime().isAfter(timeNow) && appt.getTime().isBefore(timeInOneHour)) {
                String type = "REMINDER_1H";
                if (!notificationRepository.existsByRelatedAppointmentIdAndNotificationType(appt.getId(), type)) {
                    sendReminder(appt, type, "Reminder: Your appointment is in less than an hour at " + appt.getTime().format(TIME_FMT) + ".");
                }
            }
        }
    }
    
    private void sendReminder(Appointment appt, String type, String ptMsg) {
        
        createNotification(appt.getPatient().getUser(), "Upcoming Appointment", ptMsg, type, appt);
        
        
        String drMsg = "Upcoming appointment with " + appt.getPatient().getName() + " at " + appt.getTime().format(TIME_FMT) + ".";
        createNotification(appt.getDoctor().getUser(), "Upcoming Appointment", drMsg, type, appt);
    }
    
    private void createNotification(User recipient, String title, String message, String type, Appointment appointment) {
        if (recipient == null) return;
        
        Notification notif = new Notification();
        notif.setRecipient(recipient);
        notif.setTitle(title);
        notif.setMessage(message);
        notif.setNotificationType(type);
        notif.setRelatedAppointment(appointment);
        notificationRepository.save(notif);
        
        logger.info("Reminder dispatched for appointment " + appointment.getId() + " to user " + recipient.getId());
    }
}
