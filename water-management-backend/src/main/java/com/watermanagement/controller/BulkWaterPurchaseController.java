package com.watermanagement.controller;

import com.watermanagement.model.BulkWaterPurchase;
import com.watermanagement.service.BulkWaterPurchaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bulk-water-purchases")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BulkWaterPurchaseController {
    private final BulkWaterPurchaseService bulkWaterPurchaseService;

    @PostMapping
    public ResponseEntity<BulkWaterPurchase> create(@RequestBody BulkWaterPurchase purchase) {
        return ResponseEntity.ok(bulkWaterPurchaseService.create(purchase));
    }

    @GetMapping("/{communityId}")
    public ResponseEntity<List<BulkWaterPurchase>> getByCommunity(@PathVariable String communityId) {
        return ResponseEntity.ok(bulkWaterPurchaseService.getByCommunity(communityId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BulkWaterPurchase> update(@PathVariable String id, @RequestBody BulkWaterPurchase purchase) {
        return ResponseEntity.ok(bulkWaterPurchaseService.update(id, purchase));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        bulkWaterPurchaseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
