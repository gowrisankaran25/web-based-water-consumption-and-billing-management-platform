package com.watermanagement.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(collection = "billing_cycles")
public class BillingCycle {
    @Id
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
