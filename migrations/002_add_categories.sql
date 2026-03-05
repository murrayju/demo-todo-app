-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#6b7280'
);

-- Add category_id to todos as a nullable foreign key
ALTER TABLE todos ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;

-- Insert default categories
INSERT INTO categories (name, color) VALUES
    ('Work', '#2563eb'),
    ('Personal', '#16a34a'),
    ('Shopping', '#f59e0b'),
    ('Health', '#ef4444')
ON CONFLICT (name) DO NOTHING;
