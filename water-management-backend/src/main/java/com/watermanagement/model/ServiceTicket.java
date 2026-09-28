package com.watermanagement.model;

import lombok.Data;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "service_tickets")
public class ServiceTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String communityId;
    private String flatNumber;
    private String issueType; // e.g., "METER_BROKEN", "PIPE_LEAK", "BILLING_DISPUTE"
    @Column(columnDefinition = "text")
    private String description;
    private String status; // "OPEN", "IN_PROGRESS", "RESOLVED"
    private String assignedTo; // e.g., Field Tech User ID
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime resolvedAt;
}
