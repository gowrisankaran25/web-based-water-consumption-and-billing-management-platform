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
@Table(name = "notifications")
public class NotificationMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String communityId;
    private String householdId;
    private String flatNumber;
    private String recipientEmail;
    private String channel; // EMAIL, IN_APP
    private String title;
    @Column(columnDefinition = "text")
    private String message;
    private String status; // SENT, DELIVERED, READ
    private LocalDateTime createdAt = LocalDateTime.now();
}
