# Add Full-Text Search

Add PostgreSQL full-text search so users can quickly find todos by searching their titles.

## Requirements

1. **Database migration**: Create a new SQL migration file in `migrations/` that:
   - Adds a `search_vector` column of type `tsvector` to the `todos` table.
   - Populates `search_vector` for all existing rows: `UPDATE todos SET search_vector = to_tsvector('english', title);`
   - Creates a GIN index on the `search_vector` column for fast lookups.
   - Creates a trigger function that automatically updates `search_vector` whenever `title` is inserted or updated:
     ```sql
     CREATE FUNCTION todos_search_vector_update() RETURNS trigger AS $$
     BEGIN
       NEW.search_vector := to_tsvector('english', NEW.title);
       RETURN NEW;
     END;
     $$ LANGUAGE plpgsql;
     ```
   - Attaches the trigger to the `todos` table.

2. **API changes**:
   - Add a `GET /api/todos/search?q=<query>` endpoint that:
     - Converts the user's query to a `tsquery` using `plainto_tsquery('english', $1)`.
     - Queries with `WHERE search_vector @@ plainto_tsquery('english', $1)`.
     - Orders results by relevance using `ts_rank(search_vector, query)`.
     - Returns the same shape as `GET /api/todos`.
   - Make sure `search_vector` is excluded from the JSON response (don't leak internal columns).

3. **Frontend changes**:
   - Add a search input field above the todo list.
   - As the user types (with debouncing, ~300ms), call the search endpoint and replace the displayed list with search results.
   - When the search field is empty, show all todos as before.
   - Highlight matching text in search results if feasible (optional).

## Verification

- Run `npm run migrate` to apply the new migration.
- Run `npm run build` to verify TypeScript compiles.
- Start the app with `npm run dev` and manually verify:
  - Add several todos with varied titles.
  - Search finds relevant results (e.g., searching "grocery" finds "Buy groceries").
  - Search is fast (GIN index is used -- check with `EXPLAIN ANALYZE` if desired).
  - The trigger works: new todos are immediately searchable.
  - `search_vector` does not appear in API responses.
