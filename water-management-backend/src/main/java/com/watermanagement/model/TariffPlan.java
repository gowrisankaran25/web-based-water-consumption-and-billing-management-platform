package com.watermanagement.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "tariff_plans")
public class TariffPlan {
    @Id
    private String id;
    private String communityId;
    private String name;
    
    // Core block-tier pricing for water
    private List<PricingTier> waterTiers;
    
    // Additional Multi-Service Fees
    private Double fixedInfrastructureCharge; // e.g., monthly maintenance
    private Double sewerFeePerKL; // e.g., 20% of water volume
    private Double stormwaterFlatFee; // e.g., flat charge
    
    // Baseline Minimum
    private Double baselineMinimumCharge; // Minimum bill amount regardless of usage
}
