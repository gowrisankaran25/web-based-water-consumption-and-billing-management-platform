package com.watermanagement.service;

import com.watermanagement.model.Household;
import com.watermanagement.model.PricingTier;
import com.watermanagement.model.TariffPlan;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class BillingEngineServiceTest {

    private final BillingEngineService billingEngineService = new BillingEngineService();

    @Test
    void shouldCalculateTieredBillingAndMinimumBaseline() {
        TariffPlan plan = new TariffPlan();
        plan.setWaterTiers(List.of(
                new PricingTier(10.0, 12.0),
                new PricingTier(20.0, 18.0),
                new PricingTier(null, 25.0)
        ));
        plan.setSewerFeePerKL(4.0);
        plan.setStormwaterFlatFee(60.0);
        plan.setFixedInfrastructureCharge(100.0);
        plan.setBaselineMinimumCharge(450.0);

        var invoice = billingEngineService.generateInvoice(
                "community-1",
                "A-101",
                15.0,
                plan,
                0.0,
                LocalDate.of(2026, 8, 1),
                LocalDate.of(2026, 8, 31)
        );

        // 10KL @ 12.0 = 120.0
        // 5KL @ 18.0 = 90.0
        // Water = 210.0
        // Sewer = 15 * 4.0 = 60.0
        // Stormwater = 60.0
        // Fixed = 100.0
        // Total = 430.0 -> Adjusted to baseline 450.0
        assertEquals(450.0, invoice.getAmount(), 0.01);
        assertTrue(invoice.getLineItems().size() >= 3);
    }

    @Test
    void shouldCalculateHighConsumptionTier3() {
        TariffPlan plan = new TariffPlan();
        plan.setWaterTiers(List.of(
                new PricingTier(10.0, 12.0), // 10KL @ 12
                new PricingTier(20.0, 18.0), // 20KL @ 18
                new PricingTier(null, 25.0)  // Remaining @ 25
        ));
        plan.setBaselineMinimumCharge(100.0);

        var invoice = billingEngineService.generateInvoice(
                "community-1",
                "A-102",
                40.0, // 10KL + 20KL + 10KL
                plan,
                0.0,
                LocalDate.of(2026, 8, 1),
                LocalDate.of(2026, 8, 31)
        );

        // 10 * 12 = 120
        // 20 * 18 = 360
        // 10 * 25 = 250
        // Total Water = 730
        assertEquals(730.0, invoice.getAmount(), 0.01);
    }

    @Test
    void shouldApplyBaselineMinimumChargeForZeroConsumption() {
        TariffPlan plan = new TariffPlan();
        plan.setBaselineMinimumCharge(200.0);
        
        var invoice = billingEngineService.generateInvoice(
                "community-1",
                "A-103",
                0.0,
                plan,
                0.0,
                LocalDate.of(2026, 8, 1),
                LocalDate.of(2026, 8, 31)
        );

        assertEquals(200.0, invoice.getAmount(), 0.01);
        assertTrue(invoice.getLineItems().stream().anyMatch(item -> item.getDescription().contains("Baseline Minimum Charge")));
    }

    @Test
    void shouldApportionBulkWaterCost() {
        Household h1 = new Household(); h1.setFlatNumber("A-1"); h1.setFlatAreaSqFt(1000.0);
        Household h2 = new Household(); h2.setFlatNumber("A-2"); h2.setFlatAreaSqFt(1500.0);
        List<Household> households = List.of(h1, h2);
        
        java.util.Map<String, Double> metered = new java.util.HashMap<>();
        metered.put("A-1", 100.0); // metered gets 100kL
        // A-2 is unmetered, estimated volume is 1500 * 0.1 = 150.0 kL
        // Total volume = 250.0
        // unit cost = 500.0 / 250.0 = 2.0
        
        java.util.Map<String, Double> apportioned = billingEngineService.apportionBulkWaterCosts(households, metered, 500.0);
        
        assertEquals(200.0, apportioned.get("A-1"), 0.01); // 100 * 2.0
        assertEquals(300.0, apportioned.get("A-2"), 0.01); // 150 * 2.0
    }
}
