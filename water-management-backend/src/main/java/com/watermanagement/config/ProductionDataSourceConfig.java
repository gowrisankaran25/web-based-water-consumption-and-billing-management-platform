package com.watermanagement.config;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("production")
public class ProductionDataSourceConfig {

    @Bean
    public DataSource dataSource(@Value("${DATABASE_URL}") String databaseUrl) {
        URI uri;
        try {
            uri = URI.create(databaseUrl);
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException("DATABASE_URL must be a PostgreSQL connection string");
        }

        String userInfo = uri.getRawUserInfo();
        if (!("postgres".equals(uri.getScheme()) || "postgresql".equals(uri.getScheme()))
                || uri.getHost() == null || uri.getRawPath() == null || uri.getRawPath().length() < 2
                || userInfo == null || !userInfo.contains(":")) {
            throw new IllegalStateException("DATABASE_URL must include a host, database, username, and password");
        }

        int separator = userInfo.indexOf(':');
        String username = decode(userInfo.substring(0, separator));
        String password = decode(userInfo.substring(separator + 1));
        int port = uri.getPort() == -1 ? 5432 : uri.getPort();
        String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + uri.getRawPath();
        if (uri.getRawQuery() != null) {
            jdbcUrl += "?" + uri.getRawQuery();
        }

        return DataSourceBuilder.create()
                .url(jdbcUrl)
                .username(username)
                .password(password)
                .build();
    }

    private String decode(String value) {
        try {
            return URLDecoder.decode(value.replace("+", "%2B"), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException("DATABASE_URL contains invalid percent-encoded credentials");
        }
    }
}
