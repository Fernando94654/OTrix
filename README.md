# OTrix: Industrial Cybersecurity Simulation

*This project was developed for the "Software Construction and Development" class at Tecnológico de Monterrey, in partnership with Rockwell Automation as a training partner.*

OTrix is an immersive training platform designed to sharpen the response of operators, engineers, and analysts to real-world industrial cybersecurity threats. Through a browser-based simulation, users can experience and mitigate attacks in a realistic, gamified factory floor environment.

![OTrix Gameplay](image.png)

## Project Architecture

The platform is built on a modern, decoupled architecture, consisting of three core components: a web-based frontend, a robust backend API, and a WebGL game engine.

### 1. Frontend

The frontend is the main user interface, providing access to user authentication, progress dashboards, administrative analytics, and the game itself. It's a dynamic, server-rendered application designed for a seamless user experience.

-   **User Dashboard:** Displays personal statistics, score trends, and recent plays.
-   **Admin Analytics:** Offers a comprehensive overview of platform usage, user engagement, and company-wide performance.
-   **Game Integration:** Seamlessly embeds and communicates with the Unity WebGL game client.

### 2. Backend

The backend is a RESTful API that serves as the central hub for all data and business logic. It handles user management, session authentication, game data processing, and statistical aggregation.

-   **Data Persistence:** Manages all user, level, and play data.
-   **Authentication:** Secure JWT-based authentication and role management (User, Admin).
-   **Statistics Engine:** Aggregates raw game data into meaningful analytics for the frontend dashboards.

### 3. Game

The core of the experience is the interactive simulation built with Unity. It is exported as a WebGL build, allowing it to run natively in the browser without requiring any installation.

-   **Interactive Scenarios:** Simulates real-world industrial control system (ICS) threats.
-   **Real-time Feedback:** Communicates gameplay events (scores, time, attempts) back to the backend for processing.
-   **Browser-Based:** Optimized for performance and accessibility directly within the web application.

---

## Technologies Used

| Component | Technology                                                                                             |
| :-------- | :----------------------------------------------------------------------------------------------------- |
| **Frontend**  | [**Next.js**](https://nextjs.org/), [**React**](https://react.dev/), [**TypeScript**](https://www.typescriptlang.org/), [**SASS/CSS Modules**](https://sass-lang.com/) |
| **Backend**   | [**NestJS**](https://nestjs.com/), [**TypeScript**](https://www.typescriptlang.org/), [**Prisma**](https://www.prisma.io/), [**PostgreSQL**](https://www.postgresql.org/), [**JWT**](https://jwt.io/) |
| **Game**      | [**Unity**](https://unity.com/), [**C#**](https://learn.microsoft.com/en-us/dotnet/csharp/), [**WebGL**](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) |

---

## Getting Started

To run the OTrix platform locally, you will need to set up and run each of the three components.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   [PostgreSQL](https://www.postgresql.org/download/) database
-   [Unity Hub](https://unity.com/download) with a recent Unity Editor version (e.g., 2022.3 LTS)

### 1. Backend Setup

The backend requires a running PostgreSQL instance.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory and configure your `DATABASE_URL`:
    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    ```

4.  **Apply the database schema:**
    The `dump.sql` and `PFT.sql` files in `backend/prisma/` contain the necessary table structures, triggers, and functions. Apply them to your database.

5.  **Generate Prisma Client:**
    ```bash
    npx prisma generate
    ```

6.  **Run the backend server:**
    ```bash
    npm run start:dev
    ```
    The API will be available at `http://localhost:3000`.

### 2. Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd Frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the frontend development server:**
    ```bash
    npm run dev
    ```
    The web application will be available at `http://localhost:5500`.

### 3. Game Setup

The pre-built WebGL game is located in `Game/buildwebGL`. The frontend is already configured to serve these static files.

-   To modify the game, open the `Game/` project folder in the Unity Editor.
-   After making changes, create a new WebGL build and place the output in `Frontend/public/unity/`. Ensure the build files (`Build`, `TemplateData`) are correctly referenced.

---

## How It All Works Together

1.  The user navigates to the web application served by the **Next.js Frontend**.
2.  When the user launches the simulation, the frontend loads the **Unity WebGL Game** client.
3.  As the user plays, the game sends events and results to the **NestJS Backend** API.
4.  The backend processes this data, stores it in the **PostgreSQL** database, and runs triggers/functions to update user statistics in real-time (e.g., `user_level_stats`).
5.  The frontend dashboards poll the backend to display the latest user progress and administrative analytics, providing a complete feedback loop.
