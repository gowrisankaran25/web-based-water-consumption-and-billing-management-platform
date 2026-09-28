package com.watermanagement.model;

import lombok.Data;
import jakarta.persistence.Id;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;

import java.util.List;

@Data
@Entity
@Table(name = "tariff_plans")
public class TariffPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String communityId;
    private String name;
    
    // Core block-tier pricing for water
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "tariff_water_tiers", joinColumns = @JoinColumn(name = "tariff_plan_id"))
    @OrderColumn(name = "position")
    private List<PricingTier> waterTiers;
    
    // Additional Multi-Service Fees
    private Double fixedInfrastructureCharge; // e.g., monthly maintenance
    private Double sewerFeePerKL; // e.g., 20% of water volume
    private Double stormwaterFlatFee; // e.g., flat charge
    
    // Baseline Minimum
    private Double baselineMinimumCharge; // Minimum bill amount regardless of usage
}
