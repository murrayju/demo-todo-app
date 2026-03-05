-- Add full-text search support to the todos table

-- 1. Add tsvector column for full-text search
ALTER TABLE todos ADD COLUMN search_vector tsvector;

-- 2. Populate search_vector for all existing rows
UPDATE todos SET search_vector = to_tsvector('english', title);

-- 3. Create a GIN index on search_vector for fast lookups
CREATE INDEX idx_todos_search_vector ON todos USING GIN (search_vector);

-- 4. Create trigger function to auto-update search_vector on insert/update
CREATE FUNCTION todos_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', NEW.title);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Attach the trigger to the todos table
CREATE TRIGGER todos_search_vector_trigger
  BEFORE INSERT OR UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION todos_search_vector_update();
