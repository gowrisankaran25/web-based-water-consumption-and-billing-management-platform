package com.watermanagement.service;

import com.watermanagement.model.Household;
import com.watermanagement.model.Invoice;
import com.watermanagement.model.InvoiceLineItem;
import com.watermanagement.model.PricingTier;
import com.watermanagement.model.TariffPlan;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BillingEngineService {

    public Invoice generateInvoice(String communityId, String flatNumber, double consumptionKL, TariffPlan plan, double apportionedBulkCost, LocalDate start, LocalDate end) {
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

        if (plan != null && plan.getWaterTiers() != null && !plan.getWaterTiers().isEmpty()) {
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

        if (apportionedBulkCost > 0) {
            items.add(new InvoiceLineItem("Shared / Bulk Water Allocation", apportionedBulkCost));
            totalAmount += apportionedBulkCost;
        }

        if (plan != null) {
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
        }

        invoice.setLineItems(items);
        invoice.setAmount(Math.round(totalAmount * 100.0) / 100.0);
        return invoice;
    }

    public Map<String, Double> apportionBulkWaterCosts(List<Household> households, Map<String, Double> meteredConsumptions, double totalBulkCost) {
        Map<String, Double> apportionedCosts = new HashMap<>();
        if (households == null || households.isEmpty() || totalBulkCost <= 0) {
            return apportionedCosts;
        }

        double totalEffectiveVolume = 0.0;
        Map<String, Double> effectiveVolumes = new HashMap<>();

        for (Household h : households) {
            double vol = 0.0;
            if (meteredConsumptions.containsKey(h.getFlatNumber())) {
                vol = meteredConsumptions.get(h.getFlatNumber());
            } else if (h.getFlatAreaSqFt() != null) {
                vol = h.getFlatAreaSqFt() * 0.1; // Estimate: 0.1 kL per sqft
            }
            effectiveVolumes.put(h.getFlatNumber(), vol);
            totalEffectiveVolume += vol;
        }

        if (totalEffectiveVolume <= 0) {
            return apportionedCosts;
        }

        double unitCost = totalBulkCost / totalEffectiveVolume;

        for (Household h : households) {
            double cost = unitCost * effectiveVolumes.getOrDefault(h.getFlatNumber(), 0.0);
            apportionedCosts.put(h.getFlatNumber(), Math.round(cost * 100.0) / 100.0);
        }

        return apportionedCosts;
    }
}

