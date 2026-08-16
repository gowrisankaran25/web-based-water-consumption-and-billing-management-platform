package com.watermanagement.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.watermanagement.model.Invoice;
import com.watermanagement.model.InvoiceLineItem;
import com.watermanagement.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class InvoicePdfService {

    private final InvoiceRepository invoiceRepository;

    public byte[] generateInvoicePdf(String invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24);
            Paragraph title = new Paragraph("WATER BILLING INVOICE", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Invoice Details
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy");

            document.add(new Paragraph("Invoice ID: " + invoice.getId(), normalFont));
            document.add(new Paragraph("Community ID: " + invoice.getCommunityId(), normalFont));
            document.add(new Paragraph("Flat Number: " + invoice.getFlatNumber(), normalFont));
            document.add(new Paragraph("Billing Period: " + invoice.getBillingPeriodStart().format(formatter) + " - " + invoice.getBillingPeriodEnd().format(formatter), normalFont));
            document.add(new Paragraph("Due Date: " + invoice.getDueDate().format(formatter), normalFont));
            document.add(new Paragraph("Status: " + invoice.getStatus(), normalFont));
            
            Paragraph spacing = new Paragraph(" ");
            spacing.setSpacingAfter(20);
            document.add(spacing);

            // Line Items Table
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            
            PdfPCell descHeader = new PdfPCell(new Phrase("Description", boldFont));
            descHeader.setPadding(8);
            table.addCell(descHeader);
            
            PdfPCell amtHeader = new PdfPCell(new Phrase("Amount (INR)", boldFont));
            amtHeader.setPadding(8);
            table.addCell(amtHeader);

            if (invoice.getLineItems() != null) {
                for (InvoiceLineItem item : invoice.getLineItems()) {
                    PdfPCell descCell = new PdfPCell(new Phrase(item.getDescription(), normalFont));
                    descCell.setPadding(5);
                    table.addCell(descCell);

                    PdfPCell amtCell = new PdfPCell(new Phrase(String.format("%.2f", item.getAmount()), normalFont));
                    amtCell.setPadding(5);
                    table.addCell(amtCell);
                }
            }

            // Total Amount
            PdfPCell totalDescCell = new PdfPCell(new Phrase("Total Amount", boldFont));
            totalDescCell.setPadding(8);
            totalDescCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            table.addCell(totalDescCell);

            PdfPCell totalAmtCell = new PdfPCell(new Phrase(String.format("%.2f", invoice.getAmount()), boldFont));
            totalAmtCell.setPadding(8);
            table.addCell(totalAmtCell);

            document.add(table);
            document.close();
            
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }
}
