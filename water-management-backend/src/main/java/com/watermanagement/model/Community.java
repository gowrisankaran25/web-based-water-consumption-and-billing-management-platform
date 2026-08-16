package com.watermanagement.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "communities")
public class Community {
    @Id
    private String id;
    private String name;
    private String adminEmail;
    private String adminName;
    private String adminPhone;
    private int totalFlats;
    private String status; // APPROVED, PENDING
    
    // Core settings
    private Double tariffRate; // Price per unit of water (INR)
    private LocalDateTime createdAt = LocalDateTime.now();
}
