package com.watermanagement.service;

import com.watermanagement.model.MeterReading;
import com.watermanagement.repository.MeterReadingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.DoubleStream;

@Service
@RequiredArgsConstructor
public class AnomalyDetectionService {

    private final MeterReadingRepository meterReadingRepository;

    public void analyzeReading(MeterReading reading) {
        if (reading.getReadingValue() == null || reading.getReadingValue() < 0) {
            reading.setIsAnomaly(true);
            reading.setAnomalyReason("Negative or missing consumption reading.");
            reading.setStatus("PENDING_REVIEW");
            return;
        }

        List<MeterReading> pastReadings = meterReadingRepository.findByCommunityId(reading.getCommunityId());

        Optional<MeterReading> previousReadingOpt = pastReadings.stream()
                .filter(r -> r.getFlatNumber() != null && r.getFlatNumber().equals(reading.getFlatNumber()))
                .filter(r -> r.getReadingDate() != null && r.getReadingDate().isBefore(reading.getReadingDate()))
                .max(Comparator.comparing(MeterReading::getReadingDate));

        if (previousReadingOpt.isEmpty()) {
            reading.setIsAnomaly(false);
            reading.setStatus("VERIFIED");
            return;
        }

        MeterReading previousReading = previousReadingOpt.get();
        double diff = reading.getReadingValue() - previousReading.getReadingValue();

        if (diff < 0) {
            reading.setIsAnomaly(true);
            reading.setAnomalyReason("Meter rolling backward or replaced. (Old: " + previousReading.getReadingValue() + ", New: " + reading.getReadingValue() + ")");
            reading.setStatus("PENDING_REVIEW");
            return;
        }

        if (diff == 0) {
            reading.setIsAnomaly(true);
            reading.setAnomalyReason("Zero consumption. Dead meter?");
            reading.setStatus("PENDING_REVIEW");
            return;
        }

        List<Double> previousConsumptions = pastReadings.stream()
                .filter(r -> r.getFlatNumber() != null && r.getFlatNumber().equals(reading.getFlatNumber()))
                .filter(r -> r.getReadingValue() != null && r.getReadingDate() != null && !r.getReadingDate().isAfter(reading.getReadingDate()))
                .map(r -> r.getReadingValue())
                .toList();

        if (previousConsumptions.size() < 2) {
            reading.setIsAnomaly(false);
            reading.setStatus("VERIFIED");
            return;
        }

        double mean = previousConsumptions.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double variance = previousConsumptions.stream()
                .mapToDouble(value -> Math.pow(value - mean, 2))
                .average()
                .orElse(0.0);
        double stdDev = Math.sqrt(variance);
        double threshold = mean + (2 * stdDev);

        if (diff > threshold) {
            reading.setIsAnomaly(true);
            reading.setAnomalyReason("Consumption exceeded statistical threshold of " + Math.round(threshold * 100.0) / 100.0 + " kL.");
            reading.setStatus("PENDING_REVIEW");
        } else {
            reading.setIsAnomaly(false);
            reading.setStatus("VERIFIED");
        }
    }
}
