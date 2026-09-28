package com.watermanagement.model;

import lombok.Data;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "meter_readings")
public class MeterReading {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String communityId;
    private String flatNumber;
    private Double readingValue;
    private LocalDate readingDate;
    private String status; // VERIFIED, DISPUTED, PENDING_REVIEW
    
    // Exception & Anomaly Queue
    private Boolean isAnomaly;
    @Column(columnDefinition = "text")
    private String anomalyReason; // e.g., "Negative consumption", "Usage spiked by 300%"
    
    // IoT Smart Meter support
    private String source; // MANUAL_ENTRY, CSV_UPLOAD, IOT_SMART_METER
}
