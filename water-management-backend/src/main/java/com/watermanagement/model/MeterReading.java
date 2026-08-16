package com.watermanagement.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

@Data
@Document(collection = "meter_readings")
public class MeterReading {
    @Id
    private String id;
    private String communityId;
    private String flatNumber;
    private Double readingValue;
    private LocalDate readingDate;
    private String status; // VERIFIED, DISPUTED, PENDING_REVIEW
    
    // Exception & Anomaly Queue
    private Boolean isAnomaly;
    private String anomalyReason; // e.g., "Negative consumption", "Usage spiked by 300%"
    
    // IoT Smart Meter support
    private String source; // MANUAL_ENTRY, CSV_UPLOAD, IOT_SMART_METER
}
