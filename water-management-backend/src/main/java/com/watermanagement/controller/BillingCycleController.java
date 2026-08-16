package com.watermanagement.controller;

import com.watermanagement.model.BillingCycle;
import com.watermanagement.service.BillingCycleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/billing-cycles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BillingCycleController {
    private final BillingCycleService billingCycleService;

    @PostMapping
    public ResponseEntity<BillingCycle> openCycle(@RequestParam String communityId,
                                                  @RequestParam LocalDate startDate,
                                                  @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(billingCycleService.openCycle(communityId, startDate, endDate));
    }

    @GetMapping("/{communityId}")
    public ResponseEntity<List<BillingCycle>> listByCommunity(@PathVariable String communityId) {
        return ResponseEntity.ok(billingCycleService.listByCommunity(communityId));
    }

    @PatchMapping("/{id}/finalize")
    public ResponseEntity<BillingCycle> finalizeCycle(@PathVariable String id) {
        return ResponseEntity.ok(billingCycleService.finalizeCycle(id));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<BillingCycle> archiveCycle(@PathVariable String id) {
        return ResponseEntity.ok(billingCycleService.archiveCycle(id));
    }
}
