package com.apimonitor.pinger;

import jakarta.persistence.*;

@Entity
@Table(name = "api_endpoints")
public class ApiEndpoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String url;
    private boolean isActive;

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getUrl() { return url; }
    public boolean isActive() { return isActive; }
}