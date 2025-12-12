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

### Prometheus vs Grafana
- Prometheus focuses on data acquisition, allowing users to select and aggregate time series data in real time.
- Grafana, on the other hand, focuses on data visualization

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


### Add `/metrics` into the Fastify backend

It helps to see the Application performance metrics in real-time:
- HTTP latency ✓
- Number of requests ✓
- Error rate ✓
- Event loop latency ✓
- Node.js memory usage ✓
- Node.js CPU usage ✓

=> help to detect bugs, slow routes, errors...

### Add exporter

- node_exporter:
	It helps to check the system metrics (server / container / machine running's health):
	- Host physical memory
	- Host CPU load
	- Host disk space
	- Host network usage
	- Docker container CPU limitation
	- System temperature
	- File descriptor usage
	- Disk reads/writes
	- Network packets

	=> help to detect CPU overload, disk full,...

### Test Alert to Discord

```bash
curl -H "Content-Type: application/json" -d '[
  {
    "labels": {
      "alertname": "TestAlert",
      "severity": "critical",
      "instance": "manual-test"
    },
    "annotations": {
      "summary": "This is a test from the terminal",
      "description": "If you see this, your Discord integration is working perfectly."
    },
    "generatorURL": "http://localhost:9093"
  }
]' http://localhost:9093/api/v2/alerts
```