# Todo List Demo App - Design

**Date:** 2026-03-04
**Purpose:** Dummy webapp for demoing `ox` (agent sandbox tool) features, specifically schema migrations against a Tiger Data free-tier database.

## Decisions

- **Stack:** Node.js + Express + TypeScript
- **Database:** Tiger Data free-tier service (shared compute, 750 MiB, TimescaleDB addon)
- **Migrations:** Plain SQL files with a minimal custom runner (~50 lines)
- **Frontend:** Single server-rendered HTML page with inline JS/CSS (no build step)
- **Config:** `.env` file with standard PG vars, populated via `tiger svc get <id> -o env --with-password`

## Project Structure

```
demo-todo-app/
├── package.json
├── tsconfig.json
├── .env.example
├── .env                  (gitignored)
├── .gitignore
├── src/
│   ├── index.ts          Express server + routes
│   ├── db.ts             pg Pool setup
│   ├── migrate.ts        Migration runner
│   └── views/
│       └── index.html    Frontend
├── migrations/
│   └── 001_create_todos.sql
├── scripts/
│   └── setup-db.sh       Tiger CLI service creation
└── demo_prompts/
    ├── 01-add-due-date.md
    ├── 02-add-priority.md
    ├── 03-add-categories.md
    ├── 04-add-full-text-search.md
    └── 05-add-audit-log-hypertable.md
```

## Initial Schema

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | / | Serves HTML page |
| GET | /api/todos | List all todos |
| POST | /api/todos | Create todo |
| PATCH | /api/todos/:id | Update todo |
| DELETE | /api/todos/:id | Delete todo |

## Migration Runner

- Reads `.sql` files from `migrations/` sorted by filename
- Ensures `schema_migrations` table exists
- Runs unapplied migrations in a transaction, records version
- Invoked via `npm run migrate`

## Demo Migration Ideas

Each in `demo_prompts/` as an agent-ready prompt:

1. Add `due_date` column
2. Add `priority` enum column
3. Add `categories` table + foreign key
4. Add full-text search with tsvector + GIN index
5. Add `todo_events` audit log as a TimescaleDB hypertable
