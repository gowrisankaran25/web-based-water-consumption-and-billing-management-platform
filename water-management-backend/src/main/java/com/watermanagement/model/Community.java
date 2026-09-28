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
@Table(name = "communities")
public class Community {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
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
