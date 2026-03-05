CREATE TYPE todo_priority AS ENUM ('low', 'medium', 'high');

ALTER TABLE todos
  ADD COLUMN priority todo_priority NOT NULL DEFAULT 'medium';
