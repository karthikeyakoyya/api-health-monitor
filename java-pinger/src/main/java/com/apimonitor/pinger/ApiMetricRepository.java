package com.apimonitor.pinger;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ApiMetricRepository extends JpaRepository<ApiMetric, Long> {
}