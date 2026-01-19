# ft_transcendence — Croiscendence 🥐

*This project was created as part of the 42 curriculum by Noah, Elisa, Philippe, Lan, and Tat Hoang Nguyen.*

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

#### Backend
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

IMPLEMENT A COMPLETE WEB-BASED GAME WHERE USERS CAN PLAY AGAINST EACH OTHER

> - Motivation for choosing it
We started working on Transcendence about a month before the subject was updated. In the previous version of the subject, we were required to implement a Pong game, and we decided to continue in that direction by building upon the work we had already started.

> - Implementation details
The backend is responsible for the entire game logic. It manages the positions of the paddles and the ball, the score, collision detection, and all game-related rules. It continuously sends the necessary game state data to the frontend, which is only responsible for rendering the game for each player.
This architecture was chosen to ensure a more secure and fair gameplay experience, as it prevents players from manipulating the game state or cheating.

> - Team members involved
pmenard
nrontard
layang

REMOTE PLAYERS - ENABLE TWO PLAYERS ON SEPARATE COMPUTERS TO PLAY THE SAME GAME IN REAL-TIME

> - Motivation for choosing it
From the very beginning, supporting remote players was an obvious choice for us. Our goal was to create a website that allows anyone to play on the same device against a friend, against an AI, or against another player using a different device.

> - Implementation details
To support remote players, we initially started with a private API. However, we quickly realized that this approach was not well suited for real-time gameplay. We therefore switched to using WebSockets, which provide a more efficient and reliable way to handle real-time communication between players.
The technical details of this implementation are further explained in the dedicated WebSocket module.

> - Team members involved
pmenard

- **Minor Modules** (1 point each)

IMPLEMENT A TOURNAMENT SYSTEM
> - Motivation for choosing it
We believe that tournaments are a great addition to a game, as they introduce a stronger sense of competition and engagement for players.

> - Implementation details
The first player to join a tournament is designated as its creator. This player can either wait for other participants to join or start the tournament immediately, in which case any remaining slots are filled with AI players.
To improve readability and user experience, we also added visual indicators using colors to clearly show match results and distinguish winners from losers.

> - Team members involved
pmenard

IMPLEMENT SPECTATOR MODE FOR GAMES

> - Motivation for choosing it
We wanted to allow players who were eliminated from a tournament to watch the final match if they wished.

> - Implementation details
When the final match starts, an HTML button becomes available for eliminated players. By clicking on this button, they can join the game as spectators and watch the match in real time.

> - Team members involved
pmenard

Each chosen module was selected to enhance the project’s educational value and gameplay experience.

> ( For every module:
> - Motivation for choosing it
> - Implementation details
> - Team members involved
> )

---

## Instructions

### Prerequisites

- Docker
- Docker Compose
- Node.js (for development only)

### Installation & Execution

1. Clone the repository:
  ```bash
   git clone <repository_url> croisandence
   cd ft_transcendence
  ```

2. Copy template file `.env.example` and fill in the credential values in `.env`:
  ```
  cp /back/.env.example /back/.env
  ```

2. Build and run the project:
  ```
    docker compose up --build
  ```

3. Open your browser:
  ```
    https://localhost:3000
  ```

---

## Resources

### References

- 42 ft_transcendence Subject
- [Fastify Documentation]()
- [Tailwind CSS Documentation]()
- [sqlite Documentation]()
- [Prometheus Documentation]()
- [Grafana Documentation]()
- [Avalanche Documentation]()

### AI Involvements

AI tools (as ChatGPT, Gemini 3, Mistral's Le Chat) were used for:
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


