package com.watermanagement.model;

import lombok.Data;
import jakarta.persistence.Id;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "billing_cycles")
public class BillingCycle {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String communityId;
    private LocalDate startDate;
    private LocalDate endDate;
    
    // OPEN -> FINALIZE -> ARCHIVE
    private String status; 
    
    // Aggregated stats
    private Double totalWaterConsumed;
    private Double totalBilledAmount;
    
    private LocalDateTime createdAt = LocalDateTime.now();
}
