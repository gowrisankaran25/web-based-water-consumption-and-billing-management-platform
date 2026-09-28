package com.watermanagement.model;

import lombok.Data;
import jakarta.persistence.Id;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "resident_invitations")
public class ResidentInvitation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String communityId;
    private String flatNumber;
    private String residentName;
    private String residentEmail;
    private String accessCode;
    private String status; // PENDING, ACCEPTED
    private LocalDateTime invitedAt = LocalDateTime.now();
}
