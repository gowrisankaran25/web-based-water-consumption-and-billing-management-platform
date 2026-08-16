package com.watermanagement.service;

import com.watermanagement.model.TariffPlan;
import com.watermanagement.repository.TariffPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TariffPlanService {
    private final TariffPlanRepository tariffPlanRepository;

    public TariffPlan create(TariffPlan tariffPlan) {
        return tariffPlanRepository.save(tariffPlan);
    }

    public List<TariffPlan> getByCommunityId(String communityId) {
        return tariffPlanRepository.findByCommunityId(communityId);
    }

    public TariffPlan update(String id, TariffPlan tariffPlan) {
        TariffPlan existing = tariffPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tariff plan not found"));
        existing.setCommunityId(tariffPlan.getCommunityId());
        existing.setName(tariffPlan.getName());
        existing.setWaterTiers(tariffPlan.getWaterTiers());
        existing.setFixedInfrastructureCharge(tariffPlan.getFixedInfrastructureCharge());
        existing.setSewerFeePerKL(tariffPlan.getSewerFeePerKL());
        existing.setStormwaterFlatFee(tariffPlan.getStormwaterFlatFee());
        existing.setBaselineMinimumCharge(tariffPlan.getBaselineMinimumCharge());
        return tariffPlanRepository.save(existing);
    }

    public void delete(String id) {
        tariffPlanRepository.deleteById(id);
    }
}
