package com.watermanagement.controller;

import com.watermanagement.model.TariffPlan;
import com.watermanagement.service.TariffPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tariffs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TariffPlanController {
    private final TariffPlanService tariffPlanService;

    @PostMapping
    public ResponseEntity<TariffPlan> create(@RequestBody TariffPlan tariffPlan) {
        return ResponseEntity.ok(tariffPlanService.create(tariffPlan));
    }

    @GetMapping("/{communityId}")
    public ResponseEntity<List<TariffPlan>> getByCommunity(@PathVariable String communityId) {
        return ResponseEntity.ok(tariffPlanService.getByCommunityId(communityId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TariffPlan> update(@PathVariable String id, @RequestBody TariffPlan tariffPlan) {
        return ResponseEntity.ok(tariffPlanService.update(id, tariffPlan));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        tariffPlanService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
