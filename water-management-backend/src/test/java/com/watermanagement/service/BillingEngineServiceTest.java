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
                LocalDate.of(2026, 8, 1),
                LocalDate.of(2026, 8, 31)
        );

        assertEquals(200.0, invoice.getAmount(), 0.01);
        assertTrue(invoice.getLineItems().stream().anyMatch(item -> item.getDescription().contains("Baseline Minimum Charge")));
    }

    @Test
    void shouldEstimateUnmeteredHouseholdConsumptionFromArea() {
        Household household = new Household();
        household.setFlatAreaSqFt(1200.0);
        household.setOccupants(4);

        double estimate = billingEngineService.calculateEstimatedConsumptionForHousehold(household, 0.03, 3.2);

        assertTrue(estimate > 0);
        assertEquals(36.0, estimate, 0.01);
    }

    @Test
    void shouldDistributeConsumptionByAreaWithFallback() {
        Household h1 = new Household(); h1.setFlatAreaSqFt(1000.0);
        Household h2 = new Household(); h2.setFlatAreaSqFt(1500.0);
        List<Household> households = List.of(h1, h2);
        
        double totalDistributed = billingEngineService.distributeConsumptionByArea(households, 50.0, 0.01, 1.0);
        
        // Total Area = 2500
        // h1 = 1000 / 2500 * 50 = 20.0 (Fallback: 1000 * 0.01 = 10.0 -> max(20, 10) = 20)
        // h2 = 1500 / 2500 * 50 = 30.0 (Fallback: 1500 * 0.01 = 15.0 -> max(30, 15) = 30)
        // Total = 50.0
        assertEquals(50.0, totalDistributed, 0.01);
    }
}
