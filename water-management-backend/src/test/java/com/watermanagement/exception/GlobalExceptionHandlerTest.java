package com.watermanagement.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler exceptionHandler = new GlobalExceptionHandler();

    @Test
    public void testHandleResourceNotFoundException() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Test resource not found");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleResourceNotFoundException(ex);
        
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Test resource not found", response.getBody().getMessage());
        assertEquals(404, response.getBody().getStatus());
    }

    @Test
    public void testHandleIllegalArgumentException() {
        IllegalArgumentException ex = new IllegalArgumentException("Invalid argument");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleIllegalArgumentException(ex);
        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Invalid argument", response.getBody().getMessage());
        assertEquals(400, response.getBody().getStatus());
    }

    @Test
    public void testHandleGlobalException() {
        Exception ex = new Exception("Some internal error");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleGlobalException(ex);
        
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("An unexpected error occurred: Some internal error", response.getBody().getMessage());
        assertEquals(500, response.getBody().getStatus());
    }
}
