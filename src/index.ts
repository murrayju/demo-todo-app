import express from "express";
import path from "path";
import pool from "./db";

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(express.json());

// Serve the frontend
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "src", "views", "index.html"));
});

// List all categories
app.get("/api/categories", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM categories ORDER BY name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error listing categories:", err);
    res.status(500).json({ error: "Failed to list categories" });
  }
});

// Create a category
app.post("/api/categories", async (req, res) => {
  const { name, color } = req.body;
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "Name is required" });
    return;
  }

  try {
    const result = await pool.query(
      "INSERT INTO categories (name, color) VALUES ($1, $2) RETURNING *",
      [name.trim(), color || "#6b7280"]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(409).json({ error: "Category already exists" });
      return;
    }
    console.error("Error creating category:", err);
    res.status(500).json({ error: "Failed to create category" });
  }
});

// Delete a category
app.delete("/api/categories/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM categories WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json({ deleted: result.rows[0] });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// List all todos
app.get("/api/todos", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, c.name AS category_name, c.color AS category_color
       FROM todos t
       LEFT JOIN categories c ON t.category_id = c.id
       ORDER BY t.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error listing todos:", err);
    res.status(500).json({ error: "Failed to list todos" });
  }
});

// Create a todo
app.post("/api/todos", async (req, res) => {
  const { title, category_id } = req.body;
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    res.status(400).json({ error: "Title is required" });
    return;
  }

  try {
    const result = await pool.query(
      "INSERT INTO todos (title, category_id) VALUES ($1, $2) RETURNING *",
      [title.trim(), category_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating todo:", err);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

// Update a todo
app.patch("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { title, completed, category_id } = req.body;

  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    values.push(title);
  }
  if (completed !== undefined) {
    fields.push(`completed = $${paramIndex++}`);
    values.push(completed);
  }
  if (category_id !== undefined) {
    fields.push(`category_id = $${paramIndex++}`);
    values.push(category_id);
  }

  if (fields.length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  values.push(id);

  try {
    const result = await pool.query(
      `UPDATE todos SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating todo:", err);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// Delete a todo
app.delete("/api/todos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }
    res.json({ deleted: result.rows[0] });
  } catch (err) {
    console.error("Error deleting todo:", err);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

app.listen(PORT, () => {
  console.log(`Todo app listening at http://localhost:${PORT}`);
});
