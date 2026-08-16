package com.watermanagement.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "resident_invitations")
public class ResidentInvitation {
    @Id
    private String id;
    private String communityId;
    private String flatNumber;
    private String residentName;
    private String residentEmail;
    private String accessCode;
    private String status; // PENDING, ACCEPTED
    private LocalDateTime invitedAt = LocalDateTime.now();
}
