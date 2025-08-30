const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const LRUCache = require("./LRUCache");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Initialize cache with capacity 5
const cache = new LRUCache(5);

// File path for persisting tasks
const tasksFile = path.join(__dirname, "tasks.json");

// ✅ Load tasks from file on startup
if (fs.existsSync(tasksFile)) {
  try {
    const data = JSON.parse(fs.readFileSync(tasksFile, "utf8"));
    if (Array.isArray(data)) {
      data.forEach((t) => cache.put(t.key, t.value));
    }
  } catch (err) {
    console.error("❌ Error reading tasks.json:", err);
  }
}

// ✅ Save tasks to file
function saveTasks() {
  try {
    fs.writeFileSync(tasksFile, JSON.stringify(cache.keys(), null, 2));
  } catch (err) {
    console.error("❌ Error saving tasks:", err);
  }
}

// Root route
app.get("/", (req, res) => {
  res.send("✅ Backend is running! Use /tasks to fetch tasks.");
});

// Get all tasks
app.get("/tasks", (req, res) => {
  res.json(cache.keys());
});

// Add a new task
app.post("/tasks", (req, res) => {
  const { id, task } = req.body;
  if (!id || !task) {
    return res.status(400).json({ error: "Task ID and task are required" });
  }

  const evicted = cache.put(id, task); // catch evicted task
  saveTasks(); // persist cache state

  res.json({
    message: "Task added",
    evicted, // return evicted task if any
    tasks: cache.keys(),
  });
});

// Get a specific task by ID
app.get("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const task = cache.get(id);
  if (task === -1) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.json({ id, task });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
