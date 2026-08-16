package com.watermanagement.controller;

import com.watermanagement.model.MeterReading;
import com.watermanagement.repository.MeterReadingRepository;
import com.watermanagement.service.AnomalyDetectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/meters")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AmiIntegrationController {

    private final MeterReadingRepository meterReadingRepository;
    private final AnomalyDetectionService anomalyDetectionService;

    // Secured endpoint for Smart Meters / Head-End Systems
    @PostMapping("/readings")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('COMMUNITY_ADMIN')") // In real world, maybe an IOT_DEVICE role
    public ResponseEntity<?> ingestSmartMeterReading(@RequestBody MeterReading request) {
        
        request.setSource("IOT_SMART_METER");
        if (request.getReadingDate() == null) {
            request.setReadingDate(LocalDate.now());
        }

        // Run through anomaly engine
        anomalyDetectionService.analyzeReading(request);
        
        meterReadingRepository.save(request);

        return ResponseEntity.ok().body("{\"message\": \"Meter reading ingested successfully\", \"status\": \"" + request.getStatus() + "\"}");
    }
}
