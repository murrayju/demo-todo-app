# Agent Instructions

This is a simple todo list webapp (Node.js + Express + TypeScript) backed by a Tiger Data (TimescaleDB) database. It is intentionally minimal to serve as a demo target for agent-driven development.

## Project Structure

```
src/index.ts          Express server with REST API routes
src/db.ts             PostgreSQL connection pool (configured via env vars)
src/migrate.ts        Migration runner
src/views/index.html  Minimal frontend (inline JS/CSS, no build step)
migrations/           Numbered SQL migration files
scripts/              Setup and utility scripts
demo_prompts/         Pre-written feature prompts
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript (check for type errors) |
| `npm run migrate` | Apply pending database migrations |
| `npm start` | Run compiled output (production) |

## Database

### Connection

The `.env` file contains standard PostgreSQL connection variables (`PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`). These are loaded by `src/db.ts` via dotenv.

**The credentials in `.env` point to a fork of the database, not the production instance.** You should treat this database as safe for testing. You can freely run migrations, insert test data, drop and recreate tables, or make any other schema changes without risk to production data.

### Migrations

This project uses plain SQL migration files with a minimal custom runner. There is no ORM.

**To add a migration:**

1. Create a new `.sql` file in `migrations/` with the next sequential number prefix:
   - Look at existing files to determine the next number (e.g., if `001_create_todos.sql` exists, name yours `002_something.sql`)
   - Use the pattern `NNN_short_description.sql` (zero-padded three digits, underscores)
2. Write standard PostgreSQL/TimescaleDB SQL in the file
3. Run `npm run migrate` to apply it

**How the runner works:**
- It maintains a `schema_migrations` table that tracks which files have been applied
- Migration files are sorted by filename and applied in order
- Each migration runs inside a transaction (atomic: it either fully applies or fully rolls back)
- There is no "down" migration support; write forward-only migrations
- The runner is idempotent: running it multiple times is safe (already-applied migrations are skipped)

**Migration guidelines:**
- Each migration file should be self-contained
- Use `IF NOT EXISTS` / `IF EXISTS` guards where appropriate
- For `ALTER TABLE`, remember that adding a column with a `NOT NULL` constraint requires a `DEFAULT` value (or backfill existing rows)
- The database has the TimescaleDB extension available; you can use `create_hypertable`, compression policies, continuous aggregates, etc.

### Querying

The app uses the `pg` library directly (no ORM). Queries use parameterized placeholders (`$1`, `$2`, etc.) to prevent SQL injection. See `src/index.ts` for examples.

## Frontend

The frontend is a single HTML file (`src/views/index.html`) with inline `<script>` and `<style>` tags. It uses `fetch()` to call the API. There is no build step or framework -- just edit the HTML directly.

## Verification Checklist

After making changes, verify:

1. `npm run migrate` -- migrations apply without errors
2. `npm run build` -- TypeScript compiles without errors
3. `npm run dev` -- server starts and API endpoints work (test with curl or the browser UI)
