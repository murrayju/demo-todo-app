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

const VALID_PRIORITIES = ["low", "medium", "high"] as const;
type Priority = (typeof VALID_PRIORITIES)[number];

function isValidPriority(value: unknown): value is Priority {
  return typeof value === "string" && (VALID_PRIORITIES as readonly string[]).includes(value);
}

// List all todos
app.get("/api/todos", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM todos
       ORDER BY completed ASC,
         CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 WHEN 'low' THEN 2 END ASC,
         created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error listing todos:", err);
    res.status(500).json({ error: "Failed to list todos" });
  }
});

// Create a todo
app.post("/api/todos", async (req, res) => {
  const { title, priority } = req.body;
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    res.status(400).json({ error: "Title is required" });
    return;
  }
  if (priority !== undefined && !isValidPriority(priority)) {
    res.status(400).json({ error: "Priority must be one of: low, medium, high" });
    return;
  }

  try {
    const result = await pool.query(
      "INSERT INTO todos (title, priority) VALUES ($1, $2) RETURNING *",
      [title.trim(), priority ?? "medium"]
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
  const { title, completed, priority } = req.body;

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
  if (priority !== undefined) {
    if (!isValidPriority(priority)) {
      res.status(400).json({ error: "Priority must be one of: low, medium, high" });
      return;
    }
    fields.push(`priority = $${paramIndex++}`);
    values.push(priority);
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
