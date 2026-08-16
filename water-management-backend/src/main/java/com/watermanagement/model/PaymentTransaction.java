package com.watermanagement.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "payment_transactions")
public class PaymentTransaction {
    @Id
    private String id;
    
    private String invoiceId;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
    
    private Double amount;
    private String currency = "INR";
    private String status; // CREATED, PAID, FAILED
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
