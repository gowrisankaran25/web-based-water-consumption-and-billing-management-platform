package com.watermanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;

@SpringBootApplication
@EnableScheduling
@OpenAPIDefinition(info = @Info(title = "GrokSync API", version = "1.0", description = "API Documentation for GrokSync Water Management Platform"))
public class WaterManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(WaterManagementApplication.class, args);
    }
}
