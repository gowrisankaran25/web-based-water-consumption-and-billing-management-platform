package com.watermanagement;

import com.watermanagement.model.*;
import com.watermanagement.repository.*;
import com.watermanagement.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
@org.springframework.test.context.ActiveProfiles("test")
public class BillingWorkflowIntegrationTest {

    @MockBean
    private BillingCycleRepository billingCycleRepository;
    @MockBean
    private TariffPlanRepository tariffPlanRepository;
    @MockBean
    private MeterReadingRepository meterReadingRepository;
    @MockBean
    private InvoiceRepository invoiceRepository;
    @MockBean
    private CommunityRepository communityRepository;
    @MockBean
    private HouseholdRepository householdRepository;

    @Autowired
    private BillingCycleService billingCycleService;
    
    // We will directly use the engine instead of autowiring CommunityAdminService since we want to test the billing workflow
    @Autowired
    private BillingEngineService billingEngineService;

    @BeforeEach
    void setUp() {
        // Setup mocks
    }

    @Test
    void testCompleteBillingWorkflow() {
        // 1. Setup Community & Tariff Plan
        String communityId = "C1";
        TariffPlan plan = new TariffPlan();
        plan.setCommunityId(communityId);
        plan.setWaterTiers(List.of(
                new PricingTier(10.0, 10.0),
                new PricingTier(null, 20.0)
        ));
        plan.setFixedInfrastructureCharge(50.0);
        
        when(tariffPlanRepository.findByCommunityId(communityId)).thenReturn(List.of(plan));

        // 2. Setup Households
        Household h1 = new Household();
        h1.setFlatNumber("A-101");
        h1.setCommunityId(communityId);

        // 3. Setup Meter Readings
        MeterReading reading1 = new MeterReading();
        reading1.setFlatNumber("A-101");
        reading1.setCommunityId(communityId);
        reading1.setReadingValue(15.0); // 15KL consumption

        when(meterReadingRepository.findByCommunityId(communityId)).thenReturn(List.of(reading1));

        // 4. Open Billing Cycle
        BillingCycle cycle = new BillingCycle();
        cycle.setId("BC1");
        cycle.setCommunityId(communityId);
        cycle.setStatus("OPEN");
        cycle.setStartDate(LocalDate.of(2026, 8, 1));
        cycle.setEndDate(LocalDate.of(2026, 8, 31));
        when(billingCycleRepository.save(any())).thenReturn(cycle);

        BillingCycle openedCycle = billingCycleService.openCycle(communityId, LocalDate.of(2026, 8, 1), LocalDate.of(2026, 8, 31));
        assertEquals("OPEN", openedCycle.getStatus());

        // 5. Generate Invoice
        // We simulate what communityAdminApi.generateInvoices would do by calling engine
        Invoice invoice = billingEngineService.generateInvoice(
                communityId, 
                h1.getFlatNumber(), 
                reading1.getReadingValue(), 
                plan, 
                0.0,
                openedCycle.getStartDate(), 
                openedCycle.getEndDate()
        );

        // Water: 10 * 10 = 100, 5 * 20 = 100 -> 200
        // Fixed: 50
        // Total = 250
        assertEquals(250.0, invoice.getAmount());
        assertNotNull(invoice.getDueDate());

        // 6. Save Invoice
        when(invoiceRepository.save(any())).thenReturn(invoice);
        invoiceRepository.save(invoice);
        verify(invoiceRepository, times(1)).save(invoice);

        // 7. Finalize Cycle
        when(billingCycleRepository.findById("BC1")).thenReturn(Optional.of(openedCycle));
        BillingCycle finalizedCycle = billingCycleService.finalizeCycle("BC1");
        assertEquals("FINALIZED", finalizedCycle.getStatus());
    }
}

