package com.apimonitor.pinger;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApiEndpointRepository extends JpaRepository<ApiEndpoint, Long> {
    List<ApiEndpoint> findByIsActiveTrue();
}