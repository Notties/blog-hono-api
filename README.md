# REST API with Bun, Hono, and Drizzle ORM

## ✨ Key Features

-   ⚡️ **Powered by Bun**: Uses the fast Bun runtime for development, testing, and bundling.
-   🚀 **Blazing Fast Hono**: Built on the Hono web framework, known for its exceptional performance.
-   🐘 **PostgreSQL with Drizzle ORM**: Type-safe SQL queries and schema management with Drizzle ORM.
-   🛡️ **JWT Authentication**: Secure user authentication using JSON Web Tokens.
-   👑 **Role-Based Access Control (RBAC)**: Middleware to protect routes based on user roles (`admin`, `user`).
-    caching for frequently accessed data.
-   📝 **Input Validation**: Uses `zod` for robust and type-safe validation of incoming requests.
-   🐳 **Optimized for Docker**: Includes a multi-stage `Dockerfile` that builds a tiny, secure production image.

---

## 🛠️ Technology Stack

-   **Runtime**: [Bun](https://bun.sh/)
-   **Framework**: [Hono](https://hono.dev/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/)
-   **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
-   **Authentication**: [Hono/jwt](https://hono.dev/middlewares/jwt)
-   **Validation**: [Zod](https://zod.dev/) & `@hono/zod-validator`
-   **Caching**: [Redis](https://redis.io/)
-   **Containerization**: [Docker](https://www.docker.com/)

---

## 🚀 Getting Started

### Prerequisites

-   [Bun](https://bun.sh/docs/installation) (v1.0 or higher)
-   [Docker](https://www.docker.com/get-started/) and Docker Compose

### Installation & Setup

1.  **Install dependencies:**
    ```bash
    bun install
    ```

2.  **Set up Environment Variables:**
    Create a `.env` file in the root of the project by copying the example file.
    ```bash
    cp .env.example .env
    ```
    Then, fill in the required values in the `.env` file:
    ```env
    DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DATABASE"
    JWT_SECRET="your-super-secret-and-long-jwt-secret-key"
    REDIS_URL="redis://127.0.0.1:6379"
    PORT="3000"
    ```

3.  **Run Database Migrations:**
    This command will generate your schema and apply them to the database.
    ```bash
    bun run db:push
    ```

---

## 📜 Available Scripts

-   **Development Server**: Start the server in watch mode.
    ```bash
    bun dev
    ```

-   **Production Build**: Compile the application into a single binary.
    ```bash
    bun run build
    ```

-   **Start in Production Mode**: Run the compiled binary. Requires environment variables to be set manually.
    ```bash
    bun start
    ```
---

## Endpoints

| Method   | Path                  | Description                      | Auth Required | Admin Only |
| :------- | :-------------------- | :------------------------------- | :-----------: | :--------: |
| `POST`   | `/api/auth/register`  | Register a new user.             |      ❌       |     ❌     |
| `POST`   | `/api/auth/login`     | Log in to get a JWT.             |      ❌       |     ❌     |
| `GET`    | `/api/posts`          | Get a list of all posts.         |      ❌       |     ❌     |
| `GET`    | `/api/posts/:id`      | Get a single post by its ID.     |      ❌       |     ❌     |
| `POST`   | `/api/posts`          | Create a new post.               |      ✅      |     ❌     |
| `DELETE` | `/api/posts/:id`      | Delete a post by its ID.         |      ✅      |    ✅     |

---

## 🐳 Dockerization

This project is fully containerized for easy deployment.

1.  **Build the Docker image:**
    ```bash
    docker build -t your-api-name .
    ```

2.  **Run the Docker container:**
    Make sure to pass all required environment variables to the container.
    ```bash
    docker run -p 3000:3000 \
      -e DATABASE_URL="<your_database_url>" \
      -e JWT_SECRET="<your_jwt_secret>" \
      -e REDIS_URL="<your_redis_url>" \
      -d your-api-name
    ```