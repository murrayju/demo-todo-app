# test-fake-webapp

A simple todo list webapp backed by a Tiger Data (TimescaleDB) database. Built as a demo target for `ox` agent sandbox features.

## Quick Start

### 1. Create the database

Requires [Tiger CLI](https://www.tigerdata.com/docs/ai/latest/mcp-server) installed and authenticated:

```bash
tiger auth login
./scripts/setup-db.sh
```

Or manually create a free-tier service in [Tiger Console](https://console.cloud.timescale.com) and populate `.env`:

```bash
cp .env.example .env
# Edit .env with your connection details
```

### 2. Install and run

```bash
npm install
npm run migrate
npm run dev
```

Open http://localhost:3000

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled output |
| `npm run migrate` | Apply pending database migrations |

## Migrations

SQL migration files live in `migrations/`. To add a new migration:

1. Create a file like `migrations/002_add_something.sql`
2. Run `npm run migrate`

The migration runner tracks applied migrations in a `schema_migrations` table.

## Demo Prompts

The `demo_prompts/` folder contains pre-written prompts for demoing agent-driven feature development. Each prompt describes a feature that involves a schema migration, API changes, and frontend updates.
