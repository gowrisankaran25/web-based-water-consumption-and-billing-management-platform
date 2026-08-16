package com.watermanagement.service;

import com.watermanagement.model.Community;
import com.watermanagement.repository.CommunityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class BillingCycleScheduler {
    private final CommunityRepository communityRepository;
    private final BillingCycleService billingCycleService;

    @Scheduled(cron = "0 0 0 1 * *")
    public void openMonthlyBillingCycles() {
        List<Community> communities = communityRepository.findAll();
        LocalDate today = LocalDate.now();
        LocalDate start = today.withDayOfMonth(1);
        LocalDate end = today.withDayOfMonth(today.lengthOfMonth());

        for (Community community : communities) {
            billingCycleService.openCycle(community.getId(), start, end);
        }
    }
}
