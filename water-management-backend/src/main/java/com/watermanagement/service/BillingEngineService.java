package com.watermanagement.service;

import com.watermanagement.model.Household;
import com.watermanagement.model.Invoice;
import com.watermanagement.model.InvoiceLineItem;
import com.watermanagement.model.PricingTier;
import com.watermanagement.model.TariffPlan;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class BillingEngineService {

    public Invoice generateInvoice(String communityId, String flatNumber, double consumptionKL, TariffPlan plan, LocalDate start, LocalDate end) {
        Invoice invoice = new Invoice();
        invoice.setCommunityId(communityId);
        invoice.setFlatNumber(flatNumber);
        invoice.setBillingPeriodStart(start);
        invoice.setBillingPeriodEnd(end);
        invoice.setDueDate(end.plusDays(15));
        invoice.setStatus("UNPAID");

        List<InvoiceLineItem> items = new ArrayList<>();
        double totalAmount = 0.0;

        double remainingVol = Math.max(consumptionKL, 0.0);
        double waterCharge = 0.0;

        if (plan.getWaterTiers() != null && !plan.getWaterTiers().isEmpty()) {
            for (PricingTier tier : plan.getWaterTiers()) {
                if (remainingVol <= 0) {
                    break;
                }

                double volumeInTier = tier.getMaxVolumeKL() == null
                        ? remainingVol
                        : Math.min(remainingVol, tier.getMaxVolumeKL());

                double tierCost = volumeInTier * tier.getRatePerKL();
                waterCharge += tierCost;
                remainingVol -= volumeInTier;

                items.add(new InvoiceLineItem("Water Usage (Tier @ ₹" + tier.getRatePerKL() + "/kL)", tierCost));
            }
        }

        totalAmount += waterCharge;

        if (plan.getSewerFeePerKL() != null && plan.getSewerFeePerKL() > 0) {
            double sewerCharge = consumptionKL * plan.getSewerFeePerKL();
            items.add(new InvoiceLineItem("Sewer & Wastewater Fee", sewerCharge));
            totalAmount += sewerCharge;
        }

        if (plan.getStormwaterFlatFee() != null && plan.getStormwaterFlatFee() > 0) {
            items.add(new InvoiceLineItem("Stormwater Management", plan.getStormwaterFlatFee()));
            totalAmount += plan.getStormwaterFlatFee();
        }

        if (plan.getFixedInfrastructureCharge() != null && plan.getFixedInfrastructureCharge() > 0) {
            items.add(new InvoiceLineItem("Fixed Infrastructure Charge", plan.getFixedInfrastructureCharge()));
            totalAmount += plan.getFixedInfrastructureCharge();
        }

        if (plan.getBaselineMinimumCharge() != null && totalAmount < plan.getBaselineMinimumCharge()) {
            double adjustment = plan.getBaselineMinimumCharge() - totalAmount;
            items.add(new InvoiceLineItem("Baseline Minimum Charge Adjustment", adjustment));
            totalAmount = plan.getBaselineMinimumCharge();
        }

        invoice.setLineItems(items);
        invoice.setAmount(Math.round(totalAmount * 100.0) / 100.0);
        return invoice;
    }

    public double calculateEstimatedConsumptionForHousehold(Household household, double areaConsumptionFactorPerSqFt, double occupantFactor) {
        if (household == null || household.getFlatAreaSqFt() == null) {
            return 0.0;
        }

        double estimatedConsumption = household.getFlatAreaSqFt() * areaConsumptionFactorPerSqFt;
        return Math.round(estimatedConsumption * 100.0) / 100.0;
    }

    public double distributeConsumptionByArea(List<Household> households, double totalConsumptionKL, double areaConsumptionFactorPerSqFt, double occupantFactor) {
        if (households == null || households.isEmpty() || totalConsumptionKL <= 0) {
            return 0.0;
        }

        double totalArea = households.stream()
                .filter(h -> h.getFlatAreaSqFt() != null)
                .mapToDouble(Household::getFlatAreaSqFt)
                .sum();

        if (totalArea <= 0) {
            return 0.0;
        }

        double distributed = 0.0;
        for (Household household : households) {
            if (household.getFlatAreaSqFt() == null) {
                continue;
            }
            double perHouseholdConsumption = (household.getFlatAreaSqFt() / totalArea) * totalConsumptionKL;
            double estimatedThresholdAdjustment = calculateEstimatedConsumptionForHousehold(household, areaConsumptionFactorPerSqFt, occupantFactor);
            distributed += Math.max(perHouseholdConsumption, estimatedThresholdAdjustment);
        }
        return Math.round(distributed * 100.0) / 100.0;
    }
}

