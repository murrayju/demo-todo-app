# Add Due Date Support

Add a `due_date` field to the todo list app so users can set deadlines on their todos.

## Requirements

1. **Database migration**: Create a new SQL migration file in `migrations/` that adds a `due_date` column (type `TIMESTAMPTZ`, nullable) to the `todos` table.

2. **API changes**:
   - `POST /api/todos` should accept an optional `due_date` field (ISO 8601 string).
   - `PATCH /api/todos/:id` should allow updating `due_date`.
   - `GET /api/todos` should return the `due_date` field. Sort todos so that those with upcoming due dates appear first, followed by those with no due date, then completed todos.

3. **Frontend changes**:
   - Add a date input next to the "Add" button for setting a due date when creating a todo.
   - Display the due date next to each todo item.
   - Visually highlight overdue todos (due date in the past and not completed) -- for example, show the due date in red.

## Verification

- Run `npm run migrate` to apply the new migration.
- Run `npm run build` to verify TypeScript compiles.
- Start the app with `npm run dev` and manually verify:
  - Creating a todo with and without a due date works.
  - Overdue styling appears correctly.
  - Editing a due date works via the API.
