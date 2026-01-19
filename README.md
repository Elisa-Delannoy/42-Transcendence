# ft_transcendence — Croiscendence 🥐

*This project was created as part of the 42 curriculum by **edelanno**, **lanyang**, **nrontard**, **pmenard** and **tat-nguy***

---

## ℹ️ Introduction

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

## 🧑‍🧑‍🧒‍🧒 The Team

### Team Information

| Name | Role(s) | Responsibilities |
|----|----|----|
|  | Product Owner & Developer | Product management, general decisions, stakeholders communication |
|  | Project Manager & Developer | Team organize, team communication, architecture |
|  | Scrum Master & Developer | Process and deadline tracking, infrastructure | 
|  | Back-end Lead & Developer | backend decisions, security, database |
|  | Front-end Lead & Developer | Game logic, real-time features, Frontend decisions, UI/UX |


### Project Management

- **Regular communication:** Meeting weekly in Alantis co-working place to explain the work and sync on progress and the difficulities.
- **Task organization:** Trello, GitHub Issues and Pull Requests to track who does what.
- **Work breakdown:** Project were divided according to modules and features.
- **Code reviews:** Code review every week during the meeting.
- **Documentation:** Keep notes and add into README to explain how things work.
- **Version control:** Git with feature branches and code reviews.
- **Communication channel:** Discord for daily communication and meetings.


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

## 📜 Description

### Overview

**Croiscendence** is a web-based multiplayer Pong game where players can:
- Authenticate securely
- Play real-time matches vs an AI or vs other players
- Participate in tournaments
- Track their performance

The goal of the project is to deliver a fun and competitive game while demonstrating solid full-stack engineering skills.


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

*Technical choices were made to balance performance, simplicity, and compliance with the ft_transcendence subject constraints.*


### Database Schema

SQLite database helps to store and retrieve data from these tables:

- **Users**: users information, authentication data, profile
	- Key: user_id (INTEGER)

- **Chat**: general chat history
	- Key: id (INTEGER)
 	- Relatons:
  		- user_id (INTEGER) -> **Users** user_id

- **Friend**: user's friend connections
	- Key: id (INTEGER)
 	- Relations:
  		- user_id1 (INTEGER) -> **Users** user_id
    	- user_id2 (INTEGER) -> **Users** user_id

- **game_info**: game results
	- Key: id (INTEGER)
   	- Relations:
   	  	- winner_id (INTEGER) -> **Users** user_id
   	  	- loser_id (INTEGER) -> **Users** user_id

- **tournament**: tournament status
	- Key: id (INTEGER)

- **tournament_result**: tournament results
	- Key: id (INTEGER)
 	- Relations:
  		- tournament_id (INTEGER) -> **tournament** id
		- player_id (INTEGER) -> **Users** user_id

- **achievements**: game achievements
  	- Key: achievement_id (INTEGER)
  	
- **user_achievements**: users achievement
	- Key: user_id (INTEGER), achievement_id (INTEGER)
 	- Relations:
  		- user_id -> **Users** user_id
    	- achievement_id -> **achievements** achievement_id
    
- **user_stats** (user statistics)
	- Key: user_id (INTEGER)
 	- Relations:
  		- user_id -> **Users** user_id

Relationships are designed to ensure data consistency and efficient queries.

### Key Features

- User authentication
- Real-time Pong gameplay
- Matchmaking system
- Tournament management
- User statistics and profiles

Each feature was implemented collaboratively, with ownership depending on complexity
and workload distribution.

---

## Modules in Detail

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

### I - Web

#### 1. Major: Use a framework for both the frontend and backend
#### 2. Minor: Use a frontend framework (React, Vue, Angular, Svelte, etc.)
#### 3. Minor: Use a backend framework (Express, Fastify, NestJS, Django, etc.).
#### 4. Major: Implement real-time features using WebSockets or similar technology.

#### 5. Major: Allow users to interact with other users (2 points)

> The minimum requirements are:
> - A basic chat system (send/receive messages between users).
> - A profile system (view user information).
> - A friends system (add/remove friends, see friends list).

- **Motivation**: We chose this module because it contains important and relevant features for a gaming platform.

- **Details**:
  - Basic chat system:
    - We implemented a general chat that allows users to communicate with all other connected users.
    - WebSockets enable real-time chat, available across all pages once the user is connected.
    - To ensure persistence, messages are stored in a database, with a limit of 25 messages (managed by a trigger that removes the oldest entry when a new one is added).
    - Messages are displayed in one color when a member sends a message and in another color when they receive one.
    - Multiple connections are also handled: if a user connects from multiple devices, the message bubbles remain consistent, and each message appears only once.

  - The friends page is divided into four sections:
    - search bar: to add users – includes a debounce function to avoid excessive database calls.
    - friends list: displays avatar, status (online/offline...), friendship date, and a button to delete a friend.
    - pending invitations: display username, avatar, and request date (if less than 3 days: displayed as x seconds, x minutes, x hours, or x days ago), with accept/deny and delete buttons.
    - friend suggestions: other users with whom games have been played, limited to 20 suggestions.
    - SQL queries are used to build this page. The Friend table, which associates two users with information about their friendship (date, status), and the game_info table, used for friend suggestions, provide the necessary data to build this page.
   
  - Profile system:
    - All user information are shown on the Profile page.
    - Users have a profile page displaying all their information such as username, password, email, avatar,...
    - User is also allowed to update their information and delete their own profile.
    - All user's information stores in table Users in the database.
   
- **PIC**: edelanno (chat, friend), tat-nguy (profile)

#### 6. Major: A public API to interact with the database with a secured API key, rate limiting, documentation, and at least 5 endpoints
#### 7. Minor: Use an ORM for the database
#### 8. Minor: A complete notification system for all creation, update, and deletion actions.
#### 9. Minor: Real-time collaborative features (shared workspaces, live editing, collabo-rative drawing, etc.).
#### 10. Minor: Server-Side Rendering (SSR) for improved performance and SEO.
#### 11. Minor: Progressive Web App (PWA) with offline support and installability.
#### 12. Minor: Custom-made design system with reusable components, including a propercolor palette, typography, and icons (minimum: 10 reusable components).
#### 13. Minor: Implement advanced search functionality with filters, sorting, and pagination.
#### 14. Minor: File upload and management system.


### II - Accessibility and Internationalization

### III - User Management

#### 1. Major: Standard user management and authentication (2 pts)

- **Motivation**: Enhance user experience and user engagement of the game
  
- **Module in details**:
  - Users have a profile page displaying all their information
  - User is allowed to change their own information such as *Username*, *Password*, *Email*, *2FA Enable*, *Online Status*, *Avatar*...
  - User is also allowed to delete their own profile, this action can't be recover, so we ask user to write a request, confirm their password, make sure that it's not a mistake and they really want to delete. 
  - The first time register and login with Google Oauth, users are asked to set up a password immeditately.
  - Users can upload an avatar (with a default avatar if none provided). The avatar path is stored in the Users database. A default path is set initially. Each time the avatar is updated, it is renamed as user_id.type. Upload restrictions are enforced for file size and type (6 MB – PNG and JPEG).
  - Users can add other users as friends and see their online status. On the friends page, users can send friend requests and view their friends along with their status.

- **PIC**: edelanno, tat-nguy

#### 2. Minor: Game statistics and match history (requires a game module).

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

#### 3. Minor: Implement remote authentication with OAuth 2.0 (Google, GitHub, 42, etc.)

#### 4. Major: Advanced permissions system:

#### 5. Major: An organization system

#### 6. Minor: Implement a complete 2FA (Two-Factor Authentication) system for the users

#### 7. Minor: User activity analytics and insights dashboard

### IV - Artificial Intelligence

### V - Cybersecurity

### VI - Gaming and user experience

#### 1. Major: Implement a complete web-based game where users can play against each other
#### 2. Major: Remote players — Enable two players on separate computers to play the same game in real-time
#### 3. Major: Multiplayer game (more than two players)
#### 4. Major: Add another game with user history and matchmaking
#### 5. Major: Implement advanced 3D graphics using a library like Three.js or Babylon.js.
#### 6. Minor: Advanced chat features (enhances the basic chat from "User interaction" module).
#### 7. Minor: Implement a tournament system
#### 8. Minor: Game customization options
#### 9. Minor: A gamification system to reward users for their actions

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

#### 10. Minor: Implement spectator mode for games

### VII - Devops

#### 1. Major Module: Monitoring system with Prometheus and Grafana (2 points)

- **Motivation**: This helps monitoring the server system, analyzing performance and informing the team immediately when there's a trouble in operation of the server and used services.

- **Module in details**:
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

- **PIC**: tat-nguy


### VIII - Data and Analytics

### IX - Blockchain
#### 1. Major: Store tournament scores on the Blockchain (2 pts)


### X - Modules of choice

#### 1. Minor : JWT (Json Web Token) (1 point)

- **Motivation**: For enhanced security, we have implemented a JWT-based system.
  
- **Details**:
  - Upon each login, a JWT is generated and stored in the cookies. It is valid for one hour and contains the user’s ID.
  - Using an addhook, the system checks on every page whether the JWT exists and is still valid.
  - If the token has expired or is invalid, the user is automatically logged out.
  - This JWT mechanism allows user information to be securely transmitted to the front-end.

- **PIC**: edelanno

---

## 💻 Instructions

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

## 🤖 Resources

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

## 🐛 Limitations and Potential Improvements

- Improve matchmaking algorithms
- Add spectator mode
- Enhance animations and visual effects
- Support persistent tournaments
- Improve scalability for higher player counts

---

🎮 Happy Playing! 🎮


