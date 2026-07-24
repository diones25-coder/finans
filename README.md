# Finans

**Complete personal financial management system** with expense tracking, categorized balances, and construction project monitoring. Fullstack containerized architecture with NestJS, React, PostgreSQL and Nginx.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 6, Tailwind CSS 4, Shadcn UI, TanStack Query 5, React Router 7, React Hook Form + Zod |
| Backend | NestJS 11, TypeScript, Prisma 7, PostgreSQL 16, Swagger, Helmet |
| Infrastructure | Docker, Docker Compose, Nginx, PostgreSQL 16 |

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Docker Compose                         │
│                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐   │
│  │   db      │    │ backend   │    │   frontend        │   │
│  │ Postgres │◄──►│ NestJS   │◄──►│ Nginx + React     │   │
│  │ :5432    │    │ :3004    │    │ :80               │   │
│  └──────────┘    └──────────┘    └──────────────────┘   │
│       ▲               ▲                   ▲              │
│       │   5433:5432   │   3000:3004       │   8081:80    │
│       └───────────────┴───────────────────┘              │
│                    Host (localhost)                       │
└──────────────────────────────────────────────────────────┘
```

### Request flow

```
Browser ──► localhost:8081 ──► Nginx
                                   │
                                   ├── /api/* ──► proxy_pass ──► backend:3004 ──► Prisma ──► db:5432
                                   │
                                   └── /* ──► serve index.html (SPA)
```

---

## Containerization

The project uses **Docker Compose** to orchestrate 3 services running in parallel on an isolated network, ensuring they communicate via internal DNS.

### Services

| Service | Image | Port (Host:Container) | Depends on |
|---|---|---|---|
| `db` | `postgres:16` | `5433:5432` | — |
| `backend` | local build (`./backend/Dockerfile`) | `3000:3004` | `db` (healthcheck) |
| `frontend` | local build (`./frontend/Dockerfile`) | `8081:80` | `backend` |

### Orchestration and parallel startup

Docker Compose manages the full container lifecycle:

1. **Shared network** — All services are created on the same default Compose network, allowing them to discover each other by service name (e.g., `db`, `backend`).

2. **Startup order** — Although Compose starts services in parallel, dependencies ensure correct ordering:
   - `db` starts first (no dependencies).
   - Compose waits for the **healthcheck** on `db` before releasing dependents:
     ```yaml
     healthcheck:
       test: ["CMD-SHELL", "pg_isready -U postgres"]
       interval: 5s
       timeout: 5s
       retries: 5
     ```
   - `backend` and `frontend` only begin building after `db` is healthy.

3. **Backend entrypoint** (`entrypoint.sh`) — Script that runs inside the container:
   ```bash
   # 1. Wait for PostgreSQL to accept connections
   while ! nc -z db 5432; do sleep 1; done
   # 2. Apply pending migrations
   npx prisma migrate deploy
   # 3. Start the application
   node dist/main.js
   ```

4. **True parallelism** — Once `db` is ready, `backend` and `frontend` build and start **simultaneously**, each in its own container.

### Dockerfiles

**Backend** (`backend/Dockerfile`):
- Single stage based on `node:22`
- Installs dependencies with `npm install`
- Generates Prisma Client, compiles TypeScript
- Installs `netcat-openbsd` for entrypoint healthcheck
- Exposes port 3004

**Frontend** (`frontend/Dockerfile`):
- **Multi-stage** for a lean final image:
  - **Stage 1 (builder):** `node:22-alpine` — installs dependencies and runs `npm run build` (Vite)
  - **Stage 2 (runtime):** `nginx:alpine` — copies the build to `/usr/share/nginx/html` and applies custom configuration
- Exposes port 80

### Volumes

```yaml
volumes:
  banco_data:       # Named volume for PostgreSQL persistence
```

The `banco_data` volume mounts to `/var/lib/postgresql/data` inside the `db` container, ensuring data survives `docker compose down`.

### Network and service discovery

```yaml
# Backend connects to the database via service name
DATABASE_URL="postgresql://postgres:123@db:5432/finans?schema=public"

# Nginx in the frontend reverse proxies to the backend
location /api {
    proxy_pass http://backend:3004/api;   # ← Internal Compose DNS
}
```

### Startup command

```bash
docker compose up -d --build
```

Compose will then:
1. Create the network and volume
2. Pull the `postgres:16` image
3. Build the `backend` and `frontend` images
4. Start `db`, wait for healthcheck
5. Start `backend` and `frontend` in parallel
6. Expose ports to the host

---

## Database

### Schema (Prisma)

```prisma
model User {
  id        String     @id @default(uuid())
  name      String
  email     String     @unique
  password  String
  spent     Spent[]
  category  Category[]
  createdAt DateTime   @default(now())
}

model Category {
  id        String   @id @default(uuid())
  name      String
  balance   Decimal  @db.Decimal(10, 2)
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  spent     Spent[]
  createdAt DateTime @default(now())
}

model Spent {
  id          String   @id @default(uuid())
  value       Decimal  @db.Decimal(10, 2)
  description String
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
}

model Construction {
  id           String   @id @default(uuid())
  name         String
  quantity     Int
  unitaryValue Decimal  @db.Decimal(10, 2)
  amount       Decimal  @db.Decimal(10, 2)
  createdAt    DateTime @default(now())
}
```

---

## API (Endpoints)

All endpoints are prefixed with `/api` and documented via Swagger at `http://localhost:3000/api`.

> **Authentication:** Category and Spent endpoints require a valid JWT token. Include the header `Authorization: Bearer <token>` in all requests to these resources. Obtain a token via the Auth endpoints below.

### Auth

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user (returns JWT token) |
| `POST` | `/api/auth/login` | Authenticate with email and password (returns JWT token) |

### Category

All requests must include `Authorization: Bearer <token>`. Data is scoped to the authenticated user.

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/category/create` | Create category (validates unique name per user) |
| `GET` | `/api/category/all` | List all categories for the authenticated user |
| `GET` | `/api/category/balance/:id` | Get balance of a specific category |
| `GET` | `/api/category/:id` | Get category by ID |
| `PATCH` | `/api/category/:id` | Update category |
| `PUT` | `/api/category/balance/add/:id` | Add balance to category |
| `DELETE` | `/api/category/:id` | Delete category (blocks if linked expenses exist) |

### Spent

All requests must include `Authorization: Bearer <token>`. Data is scoped to the authenticated user.

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/spent` | Create expense (deducts from category balance, validates category ownership) |
| `GET` | `/api/spent/all` | List expenses for the authenticated user (paginated: `?page=1&pageSize=5`) |
| `GET` | `/api/spent/:id` | Get expense by ID |
| `PATCH` | `/api/spent/:id` | Update expense |
| `DELETE` | `/api/spent/:id` | Delete expense |

### Construction

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/construction` | Create item (calculates `amount = quantity × unitaryValue`) |
| `GET` | `/api/construction/all` | List items (paginated) |
| `GET` | `/api/construction/amount` | Get total sum of all items |
| `GET` | `/api/construction/:id` | Get item by ID |
| `PATCH` | `/api/construction/:id` | Update item (recalculates `amount`) |
| `DELETE` | `/api/construction/:id` | Delete item |

---

## How to run

### Production (Docker)

```bash
# Clone the repository
git clone <repo-url>
cd finans

# Configure environment variables
cp backend/.env.example backend/.env
# Edit backend/.env if needed

# Start all services
docker compose up -d --build
```

Access:
- **Frontend:** http://localhost:8081
- **API:** http://localhost:3000/api
- **Swagger:** http://localhost:3000/api

### Development (without Docker)

```bash
# Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev

# Frontend (another terminal)
cd frontend
cp .env.example .env
# Edit VITE_API_URL=http://localhost:3004
npm install
npm run dev
```

---

## System Screens

> *Add screenshots of the main system interfaces here.*

### Dashboard — Expenses and Categories

![Dashboard](./frontend/src/assets/docs/dasboard.png)

Home screen with two side-by-side tables: expense entries (with pagination) and registered categories with available balance and quick actions.

### Construction Module

![Construction](./frontend/src/assets/docs/construction.png)

List of construction items with quantity, unit value, automatically calculated subtotal, and overall total highlighted in green.

### Add Expense

![Add Expense](./frontend/src/assets/docs/cadastro_gasto.png)

Form to register a new expense with description, value (BRL currency formatting), and category selection.

### Add Category

![Add Category](./frontend/src/assets/docs/cadastro_categoria.png)

Form to create a category with name and initial balance.

### Add Balance

![Add Balance](./frontend/src/assets/docs/adicionar_saldo.png)

Form to increment the balance of an existing category.

### Add Construction Item

![Add Construction Item](./frontend/src/assets/docs/gasto_construcao.png)

Form to add a construction item with name, quantity, and unit value — the subtotal is calculated automatically.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:123@db:5432/finans` |
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | `123` |
| `POSTGRES_DB` | Database name | `finans` |
| `PORT` | NestJS server port | `3004` |
| `NODE_ENV` | Runtime environment | `development` |
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key` |
| `JWT_EXPIRATION` | Token expiration time | `7d` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | API base URL (empty = Nginx proxy) | `/api` |
