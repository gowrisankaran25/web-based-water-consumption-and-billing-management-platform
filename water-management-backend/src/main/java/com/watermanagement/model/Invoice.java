package com.watermanagement.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.util.List;

@Data
@Document(collection = "invoices")
public class Invoice {
    @Id
    private String id;
    private String communityId;
    private String flatNumber;
    private Double amount; // Total amount
    private List<InvoiceLineItem> lineItems; // Breakdowns: Water, Sewer, Fixed
    private LocalDate billingPeriodStart;
    private LocalDate billingPeriodEnd;
    private LocalDate dueDate;
    private String status; // PAID, UNPAID, PENDING
    private String paymentTransactionId; // Reference to PaymentTransaction
}
