package com.apimonitor.pinger;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "api_metrics")
public class ApiMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "endpoint_id")
    private Long endpointId;

    @Column(name = "response_time")
    private Integer responseTime;

    @Column(name = "status_code")
    private Integer statusCode;

    @Column(name = "is_success")
    private Boolean isSuccess;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "checked_at")
    private LocalDateTime checkedAt;

    public void setEndpointId(Long endpointId) { this.endpointId = endpointId; }
    public void setResponseTime(Integer responseTime) { this.responseTime = responseTime; }
    public void setStatusCode(Integer statusCode) { this.statusCode = statusCode; }
    public void setIsSuccess(Boolean isSuccess) { this.isSuccess = isSuccess; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public void setCheckedAt(LocalDateTime checkedAt) { this.checkedAt = checkedAt; }
}