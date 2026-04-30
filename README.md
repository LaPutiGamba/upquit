# UpQuit

**Open-source feedback and roadmap platform.**

Collect, prioritize, and track feature requests with your team in public boards.

## Features

- Public and private feedback boards
- Real-time updates
- User authentication (access + refresh JWT tokens)
- Voting and comments
- Email notifications via Resend
- Multi-language support (English, Catalan, Spanish)

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

No other dependencies required.

---

## Quick Start

### Linux / macOS

```bash
./setup.sh && docker compose -f compose.yml up -d
```

### Windows (PowerShell)

```powershell
.\setup.ps1; docker compose -f compose.yml up -d
```

---

## Setup

### Linux / macOS

1. Clone the repository:
   ```bash
   git clone https://github.com/LaPutiGamba/upquit
   cd upquit
   ```

2. Run the setup script:
   ```bash
   ./setup.sh
   ```

3. Enter your Resend API key when prompted (optional — press Enter to skip, emails will print to console).

4. Start the services:
   ```bash
   docker compose -f compose.yml up -d
   ```

### Windows

1. Clone the repository:
   ```powershell
   git clone https://github.com/LaPutiGamba/upquit
   cd upquit
   ```

2. Run the setup script:
   ```powershell
   .\setup.ps1
   ```

3. Enter your Resend API key when prompted (optional — press Enter to skip, emails will print to console).

4. Start the services:
   ```powershell
   docker compose -f compose.yml up -d
   ```

---

## Services

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |

---

## Test Accounts

The database is pre-seeded with test accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@upquit.test | 12345678 | Admin |
| alice@upquit.test | 12345678 | Owner of Launch Pad |
| bob@upquit.test | 12345678 | Member |
| arian_aragonferriz@iescarlesvallbona.cat | 12345678 | Member |
| dave@upquit.test | 12345678 | Member |

---

## Development

To run the project locally without Docker, you'll need:

- Node.js 20+
- pnpm
- PostgreSQL 16

### Backend

```bash
cd apps/backend
cp .env.example .env
# Edit .env with your database URL and secrets
pnpm install
pnpm dev
```

### Frontend

```bash
cd apps/frontend
cp .env.example .env.local
# Edit .env.local with your backend URL
pnpm install
pnpm dev
```

### Database

```bash
# Run migrations
pnpm --filter upquit-backend run db:migrate

# Seed the database
pnpm --filter upquit-backend run db:seed

# Open Drizzle Studio
pnpm --filter upquit-backend run db:studio
```

---

## Project Structure

```
upquit/
├── apps/
│   ├── frontend/     # Next.js 16 application
│   └── backend/     # Express.js API
├── compose.yml     # Docker Compose configuration
├── setup.sh       # Setup script (Linux/macOS)
└── setup.ps1     # Setup script (Windows)
```