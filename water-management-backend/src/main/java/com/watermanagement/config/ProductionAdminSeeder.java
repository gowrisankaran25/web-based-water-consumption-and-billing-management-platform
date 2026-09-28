package com.watermanagement.config;

import com.watermanagement.model.User;
import com.watermanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("production")
@RequiredArgsConstructor
public class ProductionAdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${BOOTSTRAP_ADMIN_EMAIL:}")
    private String email;

    @Value("${BOOTSTRAP_ADMIN_PASSWORD:}")
    private String password;

    @Override
    public void run(String... args) {
        if (email.isBlank() || password.isBlank()) {
            throw new IllegalStateException("Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD for production");
        }

        if (userRepository.findByUsername(email).isEmpty()) {
            User admin = new User();
            admin.setUsername(email);
            admin.setPassword(passwordEncoder.encode(password));
            admin.setRole("SUPER_ADMIN");
            userRepository.save(admin);
        }
    }
}
