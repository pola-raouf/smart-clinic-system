package org.smartclinic.clinic.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
//    private String username;//username delete
    private String password;
    @Column(unique = true, nullable = false)
    private String email;
    @Enumerated(EnumType.STRING)
    private Role role;

    /** Public URL path, e.g. /uploads/profiles/uuid.jpg — shown in navbar & profiles */
    @Column(length = 512)
    private String profileImageUrl;
}
