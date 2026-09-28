package com.watermanagement.model;

import lombok.Data;
import jakarta.persistence.Id;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import java.time.LocalDate;
import java.util.List;

@Data
@Entity
@Table(name = "invoices")
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String communityId;
    private String flatNumber;
    private Double amount; // Total amount
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "invoice_line_items", joinColumns = @JoinColumn(name = "invoice_id"))
    @OrderColumn(name = "position")
    private List<InvoiceLineItem> lineItems; // Breakdowns: Water, Sewer, Fixed
    private LocalDate billingPeriodStart;
    private LocalDate billingPeriodEnd;
    private LocalDate dueDate;
    private String status; // PAID, UNPAID, PENDING
    private String paymentTransactionId; // Reference to PaymentTransaction
}
