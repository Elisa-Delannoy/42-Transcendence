# ft_transcendence — Croiscendence 🥐

*This project was created as part of the 42 curriculum by edelanno, lanyang, nrontard, pmenard, tat-nguy

---

## Introduction

### The Project

**ft_transcendence**, nicknamed **Croiscendence**, is a multiplayer Pong game featuring
real-time matches and a tournament system.

The project focuses on building a complete full-stack web application, combining frontend, backend, database, real-time communication, authentication, and deployment.

### General Requirements

This project follows the official **ft_transcendence** subject requirements provided by 42, including mandatory features and optional modules.

### Technical Requirements

The application respects the technical constraints imposed by the subject, such as:
- A frontend that is clear, responsive, and accessible across all devices.
- Use a CSS framework or styling solution: **Tailwind CSS**
- Store credentials (API keys, environment variables, etc.) in a local **.env** file that is ignored by Git, and provide an **.env.example** file.
- The database have a clear schema and well-defined relations.
- User management system with sign up and login securely
  - Username, Email and Password authentication with hashed password, salted
  - Additional authentication: 2FA, OAuth 2.0 (Google)
- All forms and user inputs are properly validated in both the frontend and backend.
- HTTPS is used
- Docker-based deployment

---

## The Team

### Team Information

| Name | Role(s) | Responsibilities |
|----|----|----|
|  | Product Owner & Developer | Product management, general decisions, stakeholders communication |
|  | Project Manager & Developer | Team organize, team communication, architecture |
|  | Scrum Master & Developer | Process and deadline tracking, infrastructure | 
|  | Back-end Lead & Developer | backend decisions, security, database |
|  | Front-end Lead & Developer | Game logic, real-time features, Frontend decisions, UI/UX |


---

### Project Management

- **Regular communication:** Meeting weekly in Alantis co-working place to explain the work and sync on progress and the difficulities.
- **Task organization:** Trello, GitHub Issues and Pull Requests to track who does what.
- **Work breakdown:** Project were divided according to modules and features.
- **Code reviews:** Code review every week during the meeting.
- **Documentation:** Keep notes and add into README to explain how things work.
- **Version control:** Git with feature branches and code reviews.
- **Communication channel:** Discord for daily communication and meetings.

---

### Individual Contributions

Each team member contributed to both core and optional features.  
Responsibilities included:
- Backend API development
- Frontend interface implementation
- Game logic and WebSocket communication
- Database design
- Docker configuration and deployment

Other challenges such as real-time synchronization, authentication flow, and containerization were addressed collaboratively through testing and code reviews.

---

## Description

### Overview

**Croiscendence** is a web-based multiplayer Pong game where players can:
- Authenticate securely
- Play real-time matches vs an AI or vs other players
- Participate in tournaments
- Track their performance

The goal of the project is to deliver a fun and competitive game while demonstrating solid full-stack engineering skills.

---

### Technical Stack

#### Frontend
- HTML, CSS, JavaScript
- Tailwind CSS
- TypeScript

#### Backend
- JavaScript
- Node.js
- Fastify
- TypeScript

#### Database
- SQLite (chosen for simplicity, performance, and ease of deployment)

#### Other Technologies
- WebSockets for real-time gameplay
- Docker & Docker Compose for containerization

**Technical choices were made to balance performance, simplicity, and compliance with the ft_transcendence subject constraints.**

---

### Database Schema

The database stores:
- Users (authentication data, profile, statistics)
- Matches (players, scores, results)
- Tournaments (participants, progression)

Relationships are designed to ensure data consistency and efficient queries.

---

### Key Features

- User authentication
- Real-time Pong gameplay
- Matchmaking system
- Tournament management
- Player statistics and profiles

Each feature was implemented collaboratively, with ownership depending on complexity
and workload distribution.

---

### Modules in Detail

- **Major Modules** (2 points each)
- **Minor Modules** (1 point each)

Each chosen module was selected to enhance the project’s educational value and gameplay experience.

> ( For every module:
> - Motivation for choosing it
> - Implementation details
> - Team members involved
> )

#### VII - Devops

##### 1. Major Module: Monitoring system with Prometheus and Grafana (2 points)

- Motivation: This helps monitoring the server system, analyzing performance and informing the team immediately when there's a trouble in operation of the server and used services.

- Module in details:
  - Set up Prometheus to collect metrics
    
    Prometheus was deployed as the central metrics collector (http://localhost:9090)
    
  - Configure exporters and integrations

    - Node Exporter for collecting host-level metrics (http://localhost:9101)
    - cAdvisor for collecting container-level metrics (http://localhost:8080)
    - Backend (Fastify / Node.js) for collecting application-level metrics (https://localhost:3000/metrics)

  - Create custom Grafana dashboards:

    Grafana helps visualize the metrics through these custom dashboards below:
    - **Operation System Dashboard**: Host CPU, memory disk, network usage
    - **Container Dashboard**: CPU, memory, IO, network, resource usage per container
    - **Backend Dashboard**: Heap usage, event loop lag, request rate, latency...
    - **Monitoring Stack Dashboard**: Dashboard count, active alerts, Alertmanager status

  - Set up alerting rules:

    Alerting rules were defined to detect critical issues:
    - The game down (level: 🔴 critical)
    - High CPU usage (level: 🟡 warning)
    - High heap memory usage (level: 🔵 info)
    - Event loop lag (level: 🟡 warning)
    - Unrachable services (level: 🟡 warning)

    These alerts are sent to both **AlertManager** center (http://localhost:9093) and [**Discord's Croiscendence server**](https://discord.gg/7Cda9VHh)

  - Secure access to Grafana (https://localhost:3003)

    Grafana's security was considered as an important part of this module to ensure that sensitive operational data is protected

    - Grafana runs only with **https** and behind authenticated access
    - Anonymous access to Grafana was disabled
    - Admin credentials are configured via *.env* variables and do not contain sensitive words like 'admin' or 'administrator'

- PIC: tat-nguy

---

## Instructions

### Prerequisites

- Docker
- Docker Compose
- Node.js (for development only)

### Installation & Execution

1. Clone the repository:
  ```bash
   git clone <repository_url> ft_transcendence
   cd ft_transcendence
  ```

2. Fill in required values in template file `.env.example` and turn it to `.env`:
  ```
  cp /back/.env.example /back/.env
  ```

2. Build and run the project:
  ```
    make
    make help
  ```

3. Open your browser:
  ```
    https://localhost:3000
  ```

---

## Resources

### References

- 42 ft_transcendence Subject
- [Fastify Documentation](https://fastify.dev/docs/latest/Reference/)
- [Tailwind CSS Documentation](https://v2.tailwindcss.com/docs)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Avalanche Documentation](https://build.avax.network/academy)

### AI Involvements

AI tools (such as ChatGPT, Gemini 3, Mistral's Le Chat) were used for:
- Documentation assistance and defination explication
- Code review suggestions
- Debugging guidance
- Typo and spell checking
- Image quality enhancement

All final design decisions and implementations as well as other missions were made by the team.

---

## Limitations and Potential Improvements
- Improve matchmaking algorithms
- Add spectator mode
- Enhance animations and visual effects
- Support persistent tournaments
- Improve scalability for higher player counts

Happy Playing!


