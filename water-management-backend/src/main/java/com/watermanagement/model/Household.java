package com.watermanagement.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "households")
public class Household {
    @Id
    private String id;
    private String communityId;
    private String flatNumber;
    private String residentName;
    private String residentEmail;
    private String residentPhone;
    
    private Integer occupants;
    private java.time.LocalDate moveInDate;
    
    // Auth reference
    private String userId; 
    
    // For unmetered fallback calculation
    private Double flatAreaSqFt; 
    
    // Phase 3 & 4 additions
    private Integer waterUsageThreshold; // Custom alert limit set by resident (kL)
    private Boolean disconnectionStatus; // False = connected, True = disconnected
    
    private LocalDateTime createdAt = LocalDateTime.now();
}
