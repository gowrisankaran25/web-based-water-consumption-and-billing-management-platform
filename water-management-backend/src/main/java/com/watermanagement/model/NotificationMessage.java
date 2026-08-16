package com.watermanagement.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "notifications")
public class NotificationMessage {
    @Id
    private String id;
    private String communityId;
    private String householdId;
    private String flatNumber;
    private String recipientEmail;
    private String channel; // EMAIL, IN_APP
    private String title;
    private String message;
    private String status; // SENT, DELIVERED, READ
    private LocalDateTime createdAt = LocalDateTime.now();
}
