package com.watermanagement.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PricingTier {
    private Double maxVolumeKL; // Null means infinity (e.g., > 50kL)
    private Double ratePerKL;
}
