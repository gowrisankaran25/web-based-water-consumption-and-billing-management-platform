package com.watermanagement.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(collection = "bulk_water_purchases")
public class BulkWaterPurchase {
    @Id
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
