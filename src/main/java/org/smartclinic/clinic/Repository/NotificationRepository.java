package org.smartclinic.clinic.Repository;

import org.smartclinic.clinic.Entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE n.recipient.id = :userId AND (n.scheduledAt IS NULL OR n.scheduledAt <= CURRENT_TIMESTAMP) ORDER BY n.createdAt DESC")
    Page<Notification> findVisibleNotificationsByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipient.id = :userId AND n.read = false AND (n.scheduledAt IS NULL OR n.scheduledAt <= CURRENT_TIMESTAMP)")
    long countUnreadVisibleByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.recipient.id = :userId AND n.read = false AND (n.scheduledAt IS NULL OR n.scheduledAt <= CURRENT_TIMESTAMP)")
    int markAllAsReadForUser(@Param("userId") Long userId);

    boolean existsByRelatedAppointmentIdAndNotificationType(Long appointmentId, String notificationType);
    
    boolean existsByRelatedAppointmentIdAndNotificationTypeAndScheduledAtAfter(Long appointmentId, String notificationType, LocalDateTime time);
}
