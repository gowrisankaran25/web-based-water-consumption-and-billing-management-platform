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
@Table(name = "bulk_water_purchases")
public class BulkWaterPurchase {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String communityId;
    
    private Double volumeLiters;
    private Double costINR;
    private String vendorName;
    private LocalDate purchaseDate;
    
    // Optional reference to a specific billing cycle
    private String billingCycleId;
    
    private LocalDateTime createdAt = LocalDateTime.now();
}
