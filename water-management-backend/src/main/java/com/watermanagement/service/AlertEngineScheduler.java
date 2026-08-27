package com.watermanagement.service;

import com.watermanagement.model.Household;
import com.watermanagement.model.MeterReading;
import com.watermanagement.repository.HouseholdRepository;
import com.watermanagement.repository.MeterReadingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class AlertEngineScheduler {
    private final MeterReadingRepository meterReadingRepository;
    private final HouseholdRepository householdRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 2 * * ?")
    public void scanForAnomaliesAndAlert() {
        List<MeterReading> allReadings = meterReadingRepository.findAll();
        
        for (MeterReading reading : allReadings) {
            if ("PENDING_REVIEW".equals(reading.getStatus()) && Boolean.TRUE.equals(reading.getIsAnomaly())) {
                Household h = householdRepository.findByCommunityIdAndFlatNumber(reading.getCommunityId(), reading.getFlatNumber());
                if (h != null) {
                    String title = "Anomaly Detected: Potential Leak";
                    String msg = "Your recent meter reading was flagged as an anomaly: " + reading.getAnomalyReason();
                    
                    if (h.getResidentEmail() != null) {
                        notificationService.sendEmail(reading.getCommunityId(), h.getFlatNumber(), h.getResidentEmail(), title, msg);
                    }
                    if (h.getId() != null) {
                        notificationService.sendInApp(reading.getCommunityId(), h.getId(), h.getFlatNumber(), title, msg);
                    }
                    
                    reading.setStatus("ALERTED");
                    meterReadingRepository.save(reading);
                }
            }
            
            if ("VERIFIED".equals(reading.getStatus())) {
                Household h = householdRepository.findByCommunityIdAndFlatNumber(reading.getCommunityId(), reading.getFlatNumber());
                if (h != null && h.getWaterUsageThreshold() != null && h.getWaterUsageThreshold() > 0) {
                    if (reading.getReadingValue() != null && reading.getReadingValue() > h.getWaterUsageThreshold()) {
                        String title = "Usage Threshold Exceeded";
                        String msg = "Your usage of " + reading.getReadingValue() + " kL has exceeded your set threshold of " + h.getWaterUsageThreshold() + " kL.";
                        
                        if (h.getResidentEmail() != null) {
                            notificationService.sendEmail(reading.getCommunityId(), h.getFlatNumber(), h.getResidentEmail(), title, msg);
                        }
                        if (h.getId() != null) {
                            notificationService.sendInApp(reading.getCommunityId(), h.getId(), h.getFlatNumber(), title, msg);
                        }
                        
                        reading.setStatus("THRESHOLD_ALERTED");
                        meterReadingRepository.save(reading);
                    }
                }
            }
        }
    }
}
