package org.smartclinic.clinic.service;

import lombok.RequiredArgsConstructor;
import org.smartclinic.clinic.Dto.NotificationDTO;
import org.smartclinic.clinic.Entity.Appointment;
import org.smartclinic.clinic.Entity.Notification;
import org.smartclinic.clinic.Entity.User;
import org.smartclinic.clinic.Repository.NotificationRepository;
import org.smartclinic.clinic.Repository.UserRepository;
import org.smartclinic.clinic.event.AppointmentEvent;
import org.smartclinic.clinic.util.ClinicLogger;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ClinicLogger logger = ClinicLogger.getInstance();
    
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("hh:mm a");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM d");

    @Transactional(readOnly = true)
    public List<NotificationDTO> getUserNotifications(String email, int page, int size) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Page<Notification> notifs = notificationRepository.findVisibleNotificationsByUserId(
                user.getId(), PageRequest.of(page, size));
                
        return notifs.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return notificationRepository.countUnreadVisibleByUserId(user.getId());
    }

    @Transactional
    public void markAsRead(Long notificationId, String email) {
        Notification notif = notificationRepository.findById(notificationId).orElseThrow();
        if (notif.getRecipient().getEmail().equals(email)) {
            notif.setRead(true);
            notificationRepository.save(notif);
        }
    }

    @Transactional
    public void markAllAsRead(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        notificationRepository.markAllAsReadForUser(user.getId());
    }

    // Observer Pattern: Listener for Appointment Events
    @EventListener
    @Transactional
    public void handleAppointmentEvent(AppointmentEvent event) {
        Appointment appt = event.getAppointment();
        
        try {
            switch (event.getType()) {
                case BOOKED -> {
                    // Notify Doctor
                    String drMsg = "New appointment booked with " + appt.getPatient().getName() + 
                                   " on " + appt.getDate().format(DATE_FMT) + 
                                   " at " + appt.getTime().format(TIME_FMT) + ".";
                    createNotification(appt.getDoctor().getUser(), "New Appointment", drMsg, "APPOINTMENT_BOOKED", appt);
                    
                    // Notify Patient
                    String ptMsg = "You have successfully booked an appointment with " + appt.getDoctor().getName() + 
                                   " on " + appt.getDate().format(DATE_FMT) + 
                                   " at " + appt.getTime().format(TIME_FMT) + ".";
                    createNotification(appt.getPatient().getUser(), "Appointment Booked", ptMsg, "APPOINTMENT_BOOKED", appt);
                }
                case CONFIRMED -> {
                    // Notify Patient
                    String ptMsg = "Your appointment with " + appt.getDoctor().getName() + " has been confirmed.";
                    createNotification(appt.getPatient().getUser(), "Appointment Confirmed", ptMsg, "APPOINTMENT_CONFIRMED", appt);
                }
                case CANCELLED -> {
                    // Notify Patient
                    String ptMsg = "Your appointment with " + appt.getDoctor().getName() + " on " + 
                                   appt.getDate().format(DATE_FMT) + " has been cancelled.";
                    createNotification(appt.getPatient().getUser(), "Appointment Cancelled", ptMsg, "APPOINTMENT_CANCELLED", appt);
                    
                    // Notify Doctor
                    String drMsg = "Appointment with " + appt.getPatient().getName() + " on " + 
                                   appt.getDate().format(DATE_FMT) + " at " + appt.getTime().format(TIME_FMT) + " was cancelled.";
                    createNotification(appt.getDoctor().getUser(), "Appointment Cancelled", drMsg, "APPOINTMENT_CANCELLED", appt);
                }
                case RESCHEDULED -> {
                    // Notify Patient
                    String ptMsg = "Your appointment with " + appt.getDoctor().getName() + " was rescheduled to " + 
                                   appt.getDate().format(DATE_FMT) + " at " + appt.getTime().format(TIME_FMT) + ".";
                    createNotification(appt.getPatient().getUser(), "Appointment Rescheduled", ptMsg, "APPOINTMENT_RESCHEDULED", appt);
                }
            }
        } catch (Exception e) {
            logger.error("Failed to process notification for appointment event: " + e.getMessage());
        }
    }

    public void createNotification(User recipient, String title, String message, String type, Appointment appointment) {
        if (recipient == null) return;
        
        Notification notif = new Notification();
        notif.setRecipient(recipient);
        notif.setTitle(title);
        notif.setMessage(message);
        notif.setNotificationType(type);
        notif.setRelatedAppointment(appointment);
        notificationRepository.save(notif);
        
        logger.info("Notification created for user ID " + recipient.getId() + ": " + title);
    }

    private NotificationDTO toDto(Notification notif) {
        return NotificationDTO.builder()
                .id(notif.getId())
                .title(notif.getTitle())
                .message(notif.getMessage())
                .type(notif.getNotificationType())
                .timestamp(notif.getCreatedAt().toString())
                .isRead(notif.isRead())
                .relatedAppointmentId(notif.getRelatedAppointment() != null ? notif.getRelatedAppointment().getId() : null)
                .build();
    }
}
