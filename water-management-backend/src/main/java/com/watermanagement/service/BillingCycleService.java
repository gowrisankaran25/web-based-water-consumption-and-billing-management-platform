package com.watermanagement.service;

import com.watermanagement.model.BillingCycle;
import com.watermanagement.repository.BillingCycleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BillingCycleService {
    private final BillingCycleRepository billingCycleRepository;

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
