package org.smartclinic.clinic.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private Gender gender; // ✅ FIXED

    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String address;

    /** Incremented when an appointment-linked consultation is completed. */
    @Column(nullable = false)
    private int visitCount = 0;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", unique = true)
    private User user;
}