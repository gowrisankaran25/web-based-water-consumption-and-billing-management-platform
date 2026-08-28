package com.watermanagement.config;

import com.watermanagement.model.User;
import com.watermanagement.model.MeterReading;
import com.watermanagement.model.BulkWaterPurchase;
import com.watermanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Profile("!test")
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.watermanagement.repository.CommunityRepository communityRepository;
    private final com.watermanagement.repository.HouseholdRepository householdRepository;
    private final com.watermanagement.repository.InvoiceRepository invoiceRepository;
    private final com.watermanagement.repository.ServiceTicketRepository serviceTicketRepository;
    private final com.watermanagement.repository.MeterReadingRepository meterReadingRepository;
    private final com.watermanagement.repository.BulkWaterPurchaseRepository bulkWaterPurchaseRepository;

    @Override
    public void run(String... args) throws Exception {
        // Seed Super Admin if none exists
        Optional<User> superAdminOpt = userRepository.findByUsername("admin@watermanagement.com");
        if (superAdminOpt.isEmpty()) {
            User superAdmin = new User();
            superAdmin.setUsername("admin@watermanagement.com");
            superAdmin.setPassword(passwordEncoder.encode("admin123"));
            superAdmin.setRole("SUPER_ADMIN");
            userRepository.save(superAdmin);
            System.out.println("Seeded SuperAdmin account: admin@watermanagement.com / admin123");
        }

        // Seed user's personal email
        Optional<User> personalAdminOpt = userRepository.findByUsername("gowrrisankaran25@gmail.com");
        if (personalAdminOpt.isEmpty()) {
            User personalAdmin = new User();
            personalAdmin.setUsername("gowrrisankaran25@gmail.com");
            personalAdmin.setPassword(passwordEncoder.encode("admin123"));
            personalAdmin.setRole("SUPER_ADMIN");
            userRepository.save(personalAdmin);
            System.out.println("Seeded Personal SuperAdmin account: gowrrisankaran25@gmail.com / admin123");
        }

        // --- Seed Communities ---
        if (communityRepository.count() < 3) {
            System.out.println("Seeding Communities...");
            com.watermanagement.model.Community c1 = new com.watermanagement.model.Community();
            c1.setName("Green Valley Estates");
            c1.setAdminName("Sarah Jenkins");
            c1.setAdminEmail("sarah@greenvalley.com");
            c1.setTotalFlats(150);
            c1.setStatus("APPROVED");
            c1 = communityRepository.save(c1);

            com.watermanagement.model.Community c2 = new com.watermanagement.model.Community();
            c2.setName("Oceanview Apartments");
            c2.setAdminName("Michael Chang");
            c2.setAdminEmail("mike@oceanview.com");
            c2.setTotalFlats(80);
            c2.setStatus("PENDING");
            c2 = communityRepository.save(c2);

            com.watermanagement.model.Community c3 = new com.watermanagement.model.Community();
            c3.setName("Pine Hill Residences");
            c3.setAdminName("Jessica Alba");
            c3.setAdminEmail("jessica@pinehill.com");
            c3.setTotalFlats(200);
            c3.setStatus("APPROVED");
            c3 = communityRepository.save(c3);

            // Add Admins for these communities
            if (userRepository.findByUsername("sarah@greenvalley.com").isEmpty()) {
                User u2 = new User();
                u2.setUsername("sarah@greenvalley.com");
                u2.setPassword(passwordEncoder.encode("password123"));
                u2.setRole("COMMUNITY_ADMIN");
                u2.setCommunityId(c1.getId());
                userRepository.save(u2);
            }
            if (userRepository.findByUsername("mike@oceanview.com").isEmpty()) {
                User u3 = new User();
                u3.setUsername("mike@oceanview.com");
                u3.setPassword(passwordEncoder.encode("password123"));
                u3.setRole("COMMUNITY_ADMIN");
                u3.setCommunityId(c2.getId());
                userRepository.save(u3);
                System.out.println("Seeded Oceanview Admin: mike@oceanview.com / password123");
            }

            // --- Seed Households for Green Valley ---
            com.watermanagement.model.Household h1 = new com.watermanagement.model.Household();
            h1.setCommunityId(c1.getId());
            h1.setFlatNumber("H-101");
            h1.setResidentName("John Doe");
            h1.setResidentEmail("resident@greenvalley.com");
            h1.setWaterUsageThreshold(25);
            h1.setDisconnectionStatus(false);
            householdRepository.save(h1);

            com.watermanagement.model.Household h2 = new com.watermanagement.model.Household();
            h2.setCommunityId(c1.getId());
            h2.setFlatNumber("H-102");
            h2.setResidentName("Jane Smith");
            h2.setResidentEmail("jane@greenvalley.com");
            h2.setWaterUsageThreshold(30);
            h2.setDisconnectionStatus(false);
            householdRepository.save(h2);
            
            com.watermanagement.model.Household h3 = new com.watermanagement.model.Household();
            h3.setCommunityId(c1.getId());
            h3.setFlatNumber("H-105");
            h3.setResidentName("Alice Wonderland");
            h3.setResidentEmail("alice@greenvalley.com");
            h3.setWaterUsageThreshold(35);
            h3.setDisconnectionStatus(false);
            householdRepository.save(h3);

            // Add Resident User for H-101
            if (userRepository.findByUsername("resident@greenvalley.com").isEmpty()) {
                User resident = new User();
                resident.setUsername("resident@greenvalley.com");
                resident.setPassword(passwordEncoder.encode("resident123"));
                resident.setRole("RESIDENT");
                resident.setCommunityId(c1.getId());
                userRepository.save(resident);
            }

            // --- Seed Invoices for H-101 ---
            com.watermanagement.model.Invoice inv1 = new com.watermanagement.model.Invoice();
            inv1.setCommunityId(c1.getId());
            inv1.setFlatNumber("H-101");
            inv1.setAmount(450.50);
            inv1.setStatus("PAID");
            inv1.setBillingPeriodStart(LocalDate.now().minusMonths(2).withDayOfMonth(1));
            inv1.setBillingPeriodEnd(LocalDate.now().minusMonths(2).withDayOfMonth(28));
            inv1.setDueDate(LocalDate.now().minusMonths(1).withDayOfMonth(15));
            invoiceRepository.save(inv1);

            com.watermanagement.model.Invoice inv2 = new com.watermanagement.model.Invoice();
            inv2.setCommunityId(c1.getId());
            inv2.setFlatNumber("H-101");
            inv2.setAmount(850.00);
            inv2.setStatus("PENDING");
            inv2.setBillingPeriodStart(LocalDate.now().minusMonths(1).withDayOfMonth(1));
            inv2.setBillingPeriodEnd(LocalDate.now().minusMonths(1).withDayOfMonth(28));
            inv2.setDueDate(LocalDate.now().withDayOfMonth(15));
            invoiceRepository.save(inv2);

            // --- Seed Service Tickets ---
            com.watermanagement.model.ServiceTicket t1 = new com.watermanagement.model.ServiceTicket();
            t1.setCommunityId(c1.getId());
            t1.setFlatNumber("H-101");
            t1.setIssueType("LEAK_INSPECTION");
            t1.setDescription("Water pooling near the main line");
            t1.setStatus("PENDING");
            t1.setCreatedAt(LocalDateTime.now());
            serviceTicketRepository.save(t1);
            
            com.watermanagement.model.ServiceTicket t2 = new com.watermanagement.model.ServiceTicket();
            t2.setCommunityId(c1.getId());
            t2.setFlatNumber("H-102");
            t2.setIssueType("METER_BROKEN");
            t2.setDescription("Meter display is completely blank");
            t2.setStatus("RESOLVED");
            t2.setCreatedAt(LocalDateTime.now().minusDays(2));
            serviceTicketRepository.save(t2);
            
        }

        // --- Seed Meter Readings (Normal and Anomalies) ---
        if (meterReadingRepository.count() == 0) {
            com.watermanagement.model.Community c1 = communityRepository.findAll().stream().filter(c -> "Green Valley Estates".equals(c.getName())).findFirst().orElse(null);
            if (c1 != null) {
                // Normal usage for H-101
                MeterReading m1 = new MeterReading();
                m1.setCommunityId(c1.getId());
                m1.setFlatNumber("H-101");
                m1.setReadingValue(250.5);
                m1.setReadingDate(LocalDate.now().minusDays(5));
                m1.setStatus("VERIFIED");
                m1.setIsAnomaly(false);
                m1.setSource("IOT_SMART_METER");
                meterReadingRepository.save(m1);
                
                // Normal usage for H-102
                MeterReading m2 = new MeterReading();
                m2.setCommunityId(c1.getId());
                m2.setFlatNumber("H-102");
                m2.setReadingValue(300.0);
                m2.setReadingDate(LocalDate.now().minusDays(5));
                m2.setStatus("VERIFIED");
                m2.setIsAnomaly(false);
                m2.setSource("IOT_SMART_METER");
                meterReadingRepository.save(m2);

                // Anomaly Spike for H-101
                MeterReading m3 = new MeterReading();
                m3.setCommunityId(c1.getId());
                m3.setFlatNumber("H-101");
                m3.setReadingValue(5000.5);
                m3.setReadingDate(LocalDate.now());
                m3.setStatus("PENDING_REVIEW");
                m3.setIsAnomaly(true);
                m3.setAnomalyReason("Usage spiked by 450% compared to last month");
                m3.setSource("IOT_SMART_METER");
                meterReadingRepository.save(m3);

                // Anomaly Negative for H-105
                MeterReading m4 = new MeterReading();
                m4.setCommunityId(c1.getId());
                m4.setFlatNumber("H-105");
                m4.setReadingValue(-15.0);
                m4.setReadingDate(LocalDate.now().minusDays(1));
                m4.setStatus("PENDING_REVIEW");
                m4.setIsAnomaly(true);
                m4.setAnomalyReason("Negative consumption detected (Meter Rollback?)");
                m4.setSource("IOT_SMART_METER");
                meterReadingRepository.save(m4);
                
                System.out.println("Seeded Meter Readings and Anomalies.");
            }
        }

        // --- Seed Bulk Water Purchases ---
        if (bulkWaterPurchaseRepository.count() == 0) {
            com.watermanagement.model.Community c1 = communityRepository.findAll().stream().filter(c -> "Green Valley Estates".equals(c.getName())).findFirst().orElse(null);
            if (c1 != null) {
                BulkWaterPurchase bwp1 = new BulkWaterPurchase();
                bwp1.setCommunityId(c1.getId());
                bwp1.setVolumeLiters(10000.0);
                bwp1.setCostINR(1500.0);
                bwp1.setPurchaseDate(LocalDate.now().minusDays(10));
                bwp1.setVendorName("City Water Board");
                bulkWaterPurchaseRepository.save(bwp1);
                System.out.println("Seeded Bulk Water Purchases.");
            }
        }

        // Seed Field Tech User
        if (userRepository.findByUsername("tech@watermanagement.com").isEmpty()) {
            User tech = new User();
            tech.setUsername("tech@watermanagement.com");
            tech.setPassword(passwordEncoder.encode("tech123"));
            tech.setRole("FIELD_TECH");
            userRepository.save(tech);
            System.out.println("Seeded Field Tech account: tech@watermanagement.com / tech123");
        }
        
        // Ensure Oceanview Admin exists
        Optional<com.watermanagement.model.Community> oceanviewOpt = communityRepository.findAll().stream()
                .filter(c -> "Oceanview Apartments".equals(c.getName()))
                .findFirst();
        
        if (oceanviewOpt.isPresent() && userRepository.findByUsername("mike@oceanview.com").isEmpty()) {
            User u3 = new User();
            u3.setUsername("mike@oceanview.com");
            u3.setPassword(passwordEncoder.encode("password123"));
            u3.setRole("COMMUNITY_ADMIN");
            u3.setCommunityId(oceanviewOpt.get().getId());
            userRepository.save(u3);
            System.out.println("Seeded Oceanview Admin (Post-init): mike@oceanview.com / password123");
        }

        // Force reset passwords for debugging
        userRepository.findByUsername("gowrrisankaran79@gmail.com").ifPresent(u -> {
            u.setPassword(passwordEncoder.encode("password123"));
            userRepository.save(u);
            System.out.println("Force reset password for gowrrisankaran79@gmail.com to: password123");
        });
        userRepository.findByUsername("resident@greenvalley.com").ifPresent(u -> {
            u.setPassword(passwordEncoder.encode("password123"));
            userRepository.save(u);
            System.out.println("Force reset password for resident@greenvalley.com to: password123");
        });
    }
}


