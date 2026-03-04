# Add Priority Levels

Add a priority system to the todo list app so users can mark todos as low, medium, or high priority.

## Requirements

1. **Database migration**: Create a new SQL migration file in `migrations/` that:
   - Creates a custom enum type: `CREATE TYPE todo_priority AS ENUM ('low', 'medium', 'high');`
   - Adds a `priority` column to the `todos` table with a default of `'medium'`.

2. **API changes**:
   - `POST /api/todos` should accept an optional `priority` field (one of: `low`, `medium`, `high`). Default to `medium`.
   - `PATCH /api/todos/:id` should allow updating `priority`.
   - `GET /api/todos` should return the `priority` field. Update the ordering so that within each completion status, higher priority todos appear first.
   - Add input validation: reject any priority value that isn't one of the three valid options.

3. **Frontend changes**:
   - Add a priority dropdown (low/medium/high) next to the add todo form.
   - Display a colored priority badge on each todo item:
     - High: red badge
     - Medium: yellow/orange badge
     - Low: green badge
   - Allow changing priority by clicking the badge (cycle through options, or use a dropdown).

## Verification

- Run `npm run migrate` to apply the new migration.
- Run `npm run build` to verify TypeScript compiles.
- Start the app with `npm run dev` and manually verify:
  - Creating todos with different priorities works.
  - Priority badges display with correct colors.
  - Sorting reflects priority ordering.
  - Invalid priority values are rejected by the API.
