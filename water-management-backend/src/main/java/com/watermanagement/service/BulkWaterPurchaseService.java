package com.watermanagement.service;

import com.watermanagement.model.BulkWaterPurchase;
import com.watermanagement.repository.BulkWaterPurchaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BulkWaterPurchaseService {
    private final BulkWaterPurchaseRepository bulkWaterPurchaseRepository;

    public BulkWaterPurchase create(BulkWaterPurchase purchase) {
        return bulkWaterPurchaseRepository.save(purchase);
    }

    public List<BulkWaterPurchase> getByCommunity(String communityId) {
        return bulkWaterPurchaseRepository.findByCommunityId(communityId);
    }

    public BulkWaterPurchase update(String id, BulkWaterPurchase purchase) {
        BulkWaterPurchase existing = bulkWaterPurchaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bulk water purchase not found"));
        existing.setCommunityId(purchase.getCommunityId());
        existing.setVolumeLiters(purchase.getVolumeLiters());
        existing.setCostINR(purchase.getCostINR());
        existing.setVendorName(purchase.getVendorName());
        existing.setPurchaseDate(purchase.getPurchaseDate());
        existing.setBillingCycleId(purchase.getBillingCycleId());
        return bulkWaterPurchaseRepository.save(existing);
    }

    public void delete(String id) {
        bulkWaterPurchaseRepository.deleteById(id);
    }
}
