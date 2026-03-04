# Add Categories

Add a categories/tagging system so users can organize their todos into groups.

## Requirements

1. **Database migration**: Create a new SQL migration file in `migrations/` that:
   - Creates a `categories` table with `id` (SERIAL PRIMARY KEY), `name` (TEXT NOT NULL UNIQUE), and `color` (TEXT NOT NULL DEFAULT '#6b7280') columns.
   - Adds a `category_id` column to the `todos` table as a nullable foreign key referencing `categories(id)` with `ON DELETE SET NULL`.
   - Inserts a few default categories: "Work" (#2563eb), "Personal" (#16a34a), "Shopping" (#f59e0b), "Health" (#ef4444).

2. **API changes**:
   - Add `GET /api/categories` to list all categories.
   - Add `POST /api/categories` to create a new category (`{ name, color? }`).
   - Add `DELETE /api/categories/:id` to delete a category.
   - Update `POST /api/todos` to accept an optional `category_id`.
   - Update `PATCH /api/todos/:id` to allow changing `category_id` (including setting to `null` to uncategorize).
   - Update `GET /api/todos` to include category information (join with categories table, return `category_name` and `category_color`).

3. **Frontend changes**:
   - Add a category dropdown to the todo creation form (with an "uncategorized" option).
   - Display a colored category tag on each todo item.
   - Add a simple filter: clickable category names above the list that filter which todos are shown.
   - Add a small "manage categories" section at the bottom where you can add/delete categories.

## Verification

- Run `npm run migrate` to apply the new migration.
- Run `npm run build` to verify TypeScript compiles.
- Start the app with `npm run dev` and manually verify:
  - Default categories appear in the dropdown.
  - Creating a todo with/without a category works.
  - Category filter shows only matching todos.
  - Deleting a category sets affected todos' category to null (not deleted).
