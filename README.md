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
- **Minor Modules** (1 point each)

Each chosen module was selected to enhance the project’s educational value and gameplay experience.

> ( For every module:
> - Motivation for choosing it
> - Implementation details
> - Team members involved
> )



IV.1 Web





Major: Allow users to interact with other users. The minimum requirements are:
◦ A basic chat system (send/receive messages between users).
◦ A profile system (view user information).
◦ A friends system (add/remove friends, see friends list).

We chose this module because it contains important and relevant features for a gaming platform.

We implemented a general chat that allows users to communicate with all other connected users.
WebSockets enable real-time chat, available across all pages once the user is connected.
To ensure persistence, messages are stored in a database, with a limit of 25 messages (managed by a trigger that removes the oldest entry when a new one is added).
Messages are displayed in one color when a member sends a message and in another color when they receive one.
Multiple connections are also handled: if a user connects from multiple devices, the message bubbles remain consistent, and each message appears only once.

The friends page is divided into four sections:
- search bar: to add users – includes a debounce function to avoid excessive database calls.
- friends list: displays avatar, status (online/offline...), friendship date, and a button to delete a friend.
- pending invitations: display username, avatar, and request date (if less than 3 days: displayed as x seconds, x minutes, x hours, or x days ago), with accept and delete buttons.
- friend suggestions: other users with whom games have been played, limited to 20 suggestions.

SQL queries are used to build this page. The Friend table, which associates two users with information about their friendship (date, status), and the game_info table, used for friend suggestions, provide the necessary data to build this page.





IV.3 User Management


Major: Standard user management and authentication.
◦ Users can update their profile information.
◦ Users can upload an avatar (with a default avatar if none provided).
◦ Users can add other users ass friends and see their online status.
◦ Users have a profile page displaying their information




The avatar path is stored in the Users database.
A default path is set initially. Each time the avatar is updated, it is renamed as user_id.type.
Upload restrictions are enforced for file size and type (6 MB – PNG and JPEG).

On the friends page, users can send friend requests and view their friends along with their status.


Minor: Game statistics and match history (requires a game module).
◦ Track user game statistics (wins, losses, ranking, level, etc.).
◦ Display match history (1v1 games, dates, results, opponents).
◦ Show achievements and progression.
◦ Leaderboard integration.

Player Statistics Tracking:

I implemented multiple API requests to retrieve all relevant player data, including wins, losses, and rank,
which are then dynamically displayed on the user dashboard. The player’s level is shown directly in the header,
accompanied by a visual progression bar that reflects experience gained and overall advancement in real time.

Match History System:

The DB stores a detailed match history for every player. For each 1v1 game, the following information is recorded and displayed:
◦ Match date and time
◦ Game mode (ranked, local, AI, etc.)
◦ Final result (win or loss)
◦ Opponent identity (player or AI)

Achievements and Progression:

A dedicated achievement system was designed to reward player engagement and skill progression.
Achievements can be:

◦ Unlocked, locked, or secret
◦ Based on specific conditions (number of wins, ranking reached, special accomplishments, etc.)
◦ Common, rare, secret

Ranking and Leaderboard Integration:

Competitive performance feeds directly into a leaderboard system, 
where players are ranked based on their accumulated ranking points. This provides:

◦ A clear competitive hierarchy
◦ Motivation through comparison with other players
◦ Real-time reflection of player progression in the global ranking

IV.6 Gaming and user experience
 Minor: A gamification system to reward users for their actions.
◦ Implement at least 3 of the following: achievements, badges, leaderboards,
	XP/level system, daily challenges, rewards
◦ System must be persistent (stored in database)
◦ Visual feedback for users (notifications, progress bars, etc.)
◦ Clear rules and progression mechanics

4 implementations:
◦ Avhievements
◦ XP/level system
◦ leaderboards,
◦ badges

All data is persistently stored in the database, ensuring progress is maintained between sessions.

Visual feedback is provided through notifications and progress bars, giving users real-time updates on their achievements and progression.

Rules and progression mechanics are transparent: players can view clear rules before starting a game, ensuring a fair and understandable system.



IV.10 Modules of choice
Minor : JWT (Json Web Token)

For enhanced security, we have implemented a JWT-based system.
Upon each login, a JWT is generated and stored in the cookies. It is valid for one hour and contains the user’s ID.
Using an addhook, the system checks on every page whether the JWT exists and is still valid.
If the token has expired or is invalid, the user is automatically logged out.
This JWT mechanism allows user information to be securely transmitted to the front-end.

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


