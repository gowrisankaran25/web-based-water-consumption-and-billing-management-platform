package com.watermanagement;

import com.watermanagement.model.Invoice;
import com.watermanagement.model.InvoiceLineItem;
import com.watermanagement.model.PricingTier;
import com.watermanagement.model.TariffPlan;
import com.watermanagement.repository.InvoiceRepository;
import com.watermanagement.repository.TariffPlanRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class PostgresPersistenceTest {

    @Autowired
    private TariffPlanRepository tariffPlans;

    @Autowired
    private InvoiceRepository invoices;

    @Autowired
    private EntityManager entityManager;

    @Test
    void persistsOrderedTariffTiersAndInvoiceLines() {
        String communityId = UUID.randomUUID().toString();

        TariffPlan plan = new TariffPlan();
        plan.setCommunityId(communityId);
        plan.setName("Metered water");
        plan.setWaterTiers(List.of(new PricingTier(10.0, 5.0), new PricingTier(null, 8.0)));
        String planId = tariffPlans.saveAndFlush(plan).getId();

        Invoice invoice = new Invoice();
        invoice.setCommunityId(communityId);
        invoice.setFlatNumber("A-101");
        invoice.setAmount(120.0);
        invoice.setLineItems(List.of(new InvoiceLineItem("Water", 100.0),
                new InvoiceLineItem("Sewer", 20.0)));
        String invoiceId = invoices.saveAndFlush(invoice).getId();

        entityManager.clear();

        TariffPlan loadedPlan = tariffPlans.findById(planId).orElseThrow();
        Invoice loadedInvoice = invoices.findByCommunityIdAndFlatNumber(communityId, "A-101").get(0);
        assertNotNull(loadedPlan.getId());
        assertEquals(2, loadedPlan.getWaterTiers().size());
        assertEquals(10.0, loadedPlan.getWaterTiers().get(0).getMaxVolumeKL());
        assertEquals(8.0, loadedPlan.getWaterTiers().get(1).getRatePerKL());
        assertEquals(invoiceId, loadedInvoice.getId());
        assertEquals("Water", loadedInvoice.getLineItems().get(0).getDescription());
        assertEquals("Sewer", loadedInvoice.getLineItems().get(1).getDescription());
    }
}
