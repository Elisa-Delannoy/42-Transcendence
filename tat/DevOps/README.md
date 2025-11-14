# DevOps

There are three modules:

✅ Monitoring system (minor)
🟠 ELK stack — adds observability and log management (major)
🔴 Microservices backend — the final architecture. (major - not sure we will do it)

These modules focus on enhancing the project’s infrastructure and architecture. The major modules address infrastructure setup for efficient log management using (`Elasticsearch`, `Logstash`, `Kibana`), designing the backend as microservices for flexibility and scalability, and implementing for comprehensive system monitoring.


## 🧩 Phase 1 – Monitoring System

### 🎯 Goal

The goal of this minor module is to set up a comprehensive monitoring system using `Prometheus` and `Grafana`.
=> Set up tools to monitor the containers and servers.

Key features and goals include:

- Deploy `Prometheus` as the monitoring and alerting toolkit to collect metrics
and monitor the health and performance of various system components.
	
	=> `Prometheus` is the eyes and ears into the system, it collects metrics: numbers that describe how the system is performing in real time, par example:
		- CPU usage of a container
		- Memory usage of the backend
		- HTTP request rates and response times
		- Database query counts or errors
		- Uptime of the services

- Configure data exporters and integrations to capture metrics from different
services, databases, and infrastructure components.
- Create custom dashboards and visualizations using `Grafana` to provide real-time insights into system metrics and performance.
- Set up alerting rules in `Prometheus` to proactively detect and respond to critical issues and anomalies.
- Ensure proper data retention and storage strategies for historical metrics data.
- Implement secure authentication and access control mechanisms for `Grafana` to protect sensitive monitoring data.

### 🧱 Steps

- Install `Prometheus` + `Grafana` using Docker Compose.

```bash
# example of the structure

monitoring/
├── docker-compose.yml
├── prometheus/
│   ├── prometheus.yml
│   └── rules.yml
├──	grafana/
│   └── provisioning/
│       ├── datasources/datasources.yaml
│       └── dashboards/dashboards.yaml
└── alertmanager/
    └── alertmanager.yml

# docker commands:
docker compose up -d --build
docker compose down
```

- Connect `Prometheus` to monitor the running containers (`cAdvisor` or `Docker metrics`).

- Build simple dashboards in Grafana (CPU, RAM, requests per second).

- Configure alerts (optional) — email or Slack when CPU > 80%, etc.

