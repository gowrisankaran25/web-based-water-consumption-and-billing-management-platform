package com.watermanagement.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "service_tickets")
public class ServiceTicket {
    @Id
    private String id;
    private String communityId;
    private String flatNumber;
    private String issueType; // e.g., "METER_BROKEN", "PIPE_LEAK", "BILLING_DISPUTE"
    private String description;
    private String status; // "OPEN", "IN_PROGRESS", "RESOLVED"
    private String assignedTo; // e.g., Field Tech User ID
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime resolvedAt;
}
