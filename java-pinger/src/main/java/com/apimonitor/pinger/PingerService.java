package com.apimonitor.pinger;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PingerService {

    private final ApiEndpointRepository endpointRepository;
    private final ApiMetricRepository metricRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final org.springframework.web.client.RestTemplate restTemplate;

    public PingerService(ApiEndpointRepository endpointRepository,
                         ApiMetricRepository metricRepository,
                         KafkaTemplate<String, String> kafkaTemplate) {
        this.endpointRepository = endpointRepository;
        this.metricRepository = metricRepository;
        this.kafkaTemplate = kafkaTemplate;
        this.restTemplate = new org.springframework.web.client.RestTemplate();
    }

    @Scheduled(fixedRate = 10000)
    public void pingAll() {
        List<ApiEndpoint> endpoints = endpointRepository.findByIsActiveTrue();
        for (ApiEndpoint endpoint : endpoints) {
            pingEndpoint(endpoint);
        }
    }

    @Async
    public void pingEndpoint(ApiEndpoint endpoint) {
        long start = System.currentTimeMillis();
        ApiMetric metric = new ApiMetric();
        metric.setEndpointId(endpoint.getId());
        metric.setCheckedAt(LocalDateTime.now());

        try {
            org.springframework.http.ResponseEntity<String> response =
                restTemplate.getForEntity(endpoint.getUrl(), String.class);
            long duration = System.currentTimeMillis() - start;

            metric.setResponseTime((int) duration);
            metric.setStatusCode(response.getStatusCode().value());
            metric.setIsSuccess(true);
            metric.setErrorMessage(null);

            String message = endpoint.getId() + "|" + endpoint.getName() + "|" +
                             duration + "|" + response.getStatusCode().value() + "|true";
            kafkaTemplate.send("api-metrics", message);

            System.out.println("Pinged " + endpoint.getName() + " — " + duration + "ms — HTTP " + response.getStatusCode().value());

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - start;
            metric.setResponseTime((int) duration);
            metric.setStatusCode(0);
            metric.setIsSuccess(false);
            metric.setErrorMessage(e.getMessage());

            String message = endpoint.getId() + "|" + endpoint.getName() + "|" + duration + "|0|false";
            kafkaTemplate.send("api-metrics", message);

            System.out.println("Failed " + endpoint.getName() + " — " + e.getMessage());
        }

        metricRepository.save(metric);
    }
}