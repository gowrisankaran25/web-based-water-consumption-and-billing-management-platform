package com.watermanagement.controller;

import com.watermanagement.config.ProductionAdminSeeder;
import com.watermanagement.model.User;
import com.watermanagement.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class DeploymentSecurityTest {

    @Test
    void registrationCannotChooseSuperAdminRole() {
        UserRepository users = mock(UserRepository.class);
        AuthController controller = new AuthController(null, users, null, null, null, null);
        RegisterRequest request = new RegisterRequest();
        request.setUsername("attacker@example.com");
        request.setRole("SUPER_ADMIN");

        assertEquals(HttpStatus.BAD_REQUEST, controller.registerUser(request).getStatusCode());
        verifyNoInteractions(users);
    }

    @Test
    void productionDoesNotReturnPasswordResetLinks() {
        UserRepository users = mock(UserRepository.class);
        AuthController controller = new AuthController(null, users, null, null, null, null);
        ReflectionTestUtils.setField(controller, "demoMode", false);
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("admin@example.com");

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, controller.forgotPassword(request).getStatusCode());
        verifyNoInteractions(users);
    }

    @Test
    void productionBootstrapCreatesAdminWithoutResettingExistingPassword() {
        UserRepository users = mock(UserRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        ProductionAdminSeeder seeder = new ProductionAdminSeeder(users, encoder);
        ReflectionTestUtils.setField(seeder, "email", "admin@example.com");
        ReflectionTestUtils.setField(seeder, "password", "unique-password");

        when(users.findByUsername("admin@example.com")).thenReturn(Optional.empty());
        when(encoder.encode("unique-password")).thenReturn("hashed-password");
        seeder.run();

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(users).save(saved.capture());
        assertEquals("SUPER_ADMIN", saved.getValue().getRole());
        assertEquals("hashed-password", saved.getValue().getPassword());

        reset(users, encoder);
        when(users.findByUsername("admin@example.com")).thenReturn(Optional.of(saved.getValue()));
        seeder.run();
        verify(users, never()).save(any());
        verifyNoInteractions(encoder);
    }
}
