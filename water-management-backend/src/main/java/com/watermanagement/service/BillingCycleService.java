package com.watermanagement.service;

import com.watermanagement.model.*;
import com.watermanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillingCycleService {
    private final BillingCycleRepository billingCycleRepository;
    private final HouseholdRepository householdRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final BulkWaterPurchaseRepository bulkWaterPurchaseRepository;
    private final TariffPlanRepository tariffPlanRepository;
    private final InvoiceRepository invoiceRepository;
    private final BillingEngineService billingEngineService;
    private final EmailService emailService;

    public BillingCycle openCycle(String communityId, LocalDate startDate, LocalDate endDate) {
        BillingCycle cycle = new BillingCycle();
        cycle.setCommunityId(communityId);
        cycle.setStartDate(startDate);
        cycle.setEndDate(endDate);
        cycle.setStatus("OPEN");
        return billingCycleRepository.save(cycle);
    }

    public BillingCycle finalizeCycle(String id) {
        BillingCycle cycle = billingCycleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Billing cycle not found"));

        if ("FINALIZED".equals(cycle.getStatus())) {
            return cycle; // already finalized
        }

        String communityId = cycle.getCommunityId();

        List<Household> households = householdRepository.findByCommunityId(communityId);
        List<MeterReading> readings = meterReadingRepository.findByCommunityId(communityId).stream()
                .filter(r -> "VERIFIED".equals(r.getStatus()))
                .filter(r -> r.getReadingDate() != null && !r.getReadingDate().isBefore(cycle.getStartDate()) && !r.getReadingDate().isAfter(cycle.getEndDate()))
                .collect(Collectors.toList());

        Map<String, Double> meteredConsumptions = new HashMap<>();
        for (MeterReading r : readings) {
            meteredConsumptions.merge(r.getFlatNumber(), r.getReadingValue(), Double::sum);
        }

        List<BulkWaterPurchase> bulkPurchases = bulkWaterPurchaseRepository.findByCommunityId(communityId).stream()
                .filter(b -> b.getPurchaseDate() != null && !b.getPurchaseDate().isBefore(cycle.getStartDate()) && !b.getPurchaseDate().isAfter(cycle.getEndDate()))
                .collect(Collectors.toList());
        double totalBulkCost = bulkPurchases.stream().mapToDouble(BulkWaterPurchase::getCostINR).sum();

        Map<String, Double> apportionedCosts = billingEngineService.apportionBulkWaterCosts(households, meteredConsumptions, totalBulkCost);

        List<TariffPlan> plans = tariffPlanRepository.findByCommunityId(communityId);
        TariffPlan plan = plans.isEmpty() ? null : plans.get(0);

        List<Invoice> generatedInvoices = new java.util.ArrayList<>();
        for (Household h : households) {
            double consumption = meteredConsumptions.getOrDefault(h.getFlatNumber(), 0.0);
            double apportionedCost = apportionedCosts.getOrDefault(h.getFlatNumber(), 0.0);

            Invoice inv = billingEngineService.generateInvoice(communityId, h.getFlatNumber(), consumption, plan, apportionedCost, cycle.getStartDate(), cycle.getEndDate());
            generatedInvoices.add(inv);
        }

        invoiceRepository.saveAll(generatedInvoices);

        // Send email notifications to all residents
        for (Invoice inv : generatedInvoices) {
            households.stream()
                .filter(h -> h.getFlatNumber().equals(inv.getFlatNumber()))
                .findFirst()
                .ifPresent(h -> {
                    if (h.getResidentEmail() != null && !h.getResidentEmail().isEmpty()) {
                        emailService.sendMonthlyBill(
                            h.getResidentEmail(), 
                            h.getResidentName(), 
                            inv.getAmount(), 
                            inv.getDueDate() != null ? inv.getDueDate().toString() : inv.getBillingPeriodEnd().plusDays(15).toString()
                        );
                    }
                });
        }

        cycle.setStatus("FINALIZED");
        return billingCycleRepository.save(cycle);
    }

    public BillingCycle archiveCycle(String id) {
        BillingCycle cycle = billingCycleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Billing cycle not found"));
        cycle.setStatus("ARCHIVED");
        return billingCycleRepository.save(cycle);
    }

    public List<BillingCycle> listByCommunity(String communityId) {
        return billingCycleRepository.findByCommunityId(communityId);
    }
}

