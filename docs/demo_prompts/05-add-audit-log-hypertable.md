# Add Audit Log with TimescaleDB Hypertable

Add an event audit log that tracks all changes to todos, stored as a TimescaleDB hypertable for efficient time-series querying.

## Requirements

1. **Database migration**: Create a new SQL migration file in `migrations/` that:
   - Enables the TimescaleDB extension: `CREATE EXTENSION IF NOT EXISTS timescaledb;`
   - Creates a `todo_events` table:
     ```sql
     CREATE TABLE todo_events (
         id BIGSERIAL,
         todo_id INTEGER NOT NULL,
         event_type TEXT NOT NULL,  -- 'created', 'updated', 'completed', 'uncompleted', 'deleted'
         event_data JSONB,          -- snapshot of the todo at event time
         created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
     );
     ```
   - Converts it to a hypertable: `SELECT create_hypertable('todo_events', by_range('created_at'));`
   - Adds a compression policy (compress chunks older than 7 days):
     ```sql
     ALTER TABLE todo_events SET (
         timescaledb.compress,
         timescaledb.compress_segmentby = 'todo_id',
         timescaledb.compress_orderby = 'created_at DESC'
     );
     SELECT add_compression_policy('todo_events', INTERVAL '7 days');
     ```

2. **API changes**:
   - After every todo create, update, and delete operation, insert a corresponding event into `todo_events` with the appropriate `event_type` and a JSON snapshot of the todo.
   - For updates, distinguish between `completed`/`uncompleted` events and general `updated` events.
   - Add `GET /api/todos/:id/history` that returns the event history for a specific todo, ordered by time descending.
   - Add `GET /api/stats` that returns aggregate statistics using TimescaleDB functions:
     - Total events in the last 24 hours, 7 days, 30 days (using `time_bucket`).
     - Most active todos (by event count).
     - Completion rate over time (todos completed vs created per day).

3. **Frontend changes**:
   - Add a small "history" icon/button on each todo item that, when clicked, shows a timeline of events for that todo (created, updated, completed, etc.) in a dropdown or modal.
   - Add a "Stats" section at the bottom of the page showing the aggregate statistics from the stats endpoint.

## Verification

- Run `npm run migrate` to apply the new migration.
- Run `npm run build` to verify TypeScript compiles.
- Start the app with `npm run dev` and manually verify:
  - Create, update, complete, and delete some todos.
  - Check `GET /api/todos/:id/history` returns correct event timeline.
  - Check `GET /api/stats` returns meaningful aggregate data.
  - Verify the hypertable is working: `SELECT * FROM timescaledb_information.hypertables;`
  - Verify compression policy is set: `SELECT * FROM timescaledb_information.compression_settings;`
