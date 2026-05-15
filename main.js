const { app, BrowserWindow, ipcMain } = require("electron");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
let win;
let developMode = false;
// Initialize database
const dbPath = path.join(__dirname, "Database", "log_events.db");
const db = new sqlite3.Database(dbPath);
// Initialize schema
db.run(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    type TEXT,
    event TEXT,
    details TEXT
  )
`);
function createWindow() {
  win = new BrowserWindow({
    width: 600,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    }
  });
  win.loadFile("Bone_Code/html/index.html");
}
// IPC Handlers for logging
ipcMain.handle("enable-develop-mode", () => {
  developMode = true;
  return { success: true, mode: developMode };
});
ipcMain.handle("disable-develop-mode", () => {
  developMode = false;
  return { success: true, mode: developMode };
});
ipcMain.handle("get-develop-mode", () => {
  return developMode;
});
ipcMain.handle("add-log", (event, entry) => {
  if (!developMode) return;
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: entry.type || "info",
    event: entry.event || "",
    details: JSON.stringify(entry.details || {})
  };
  return new Promise((resolve) => {
    db.run(
      `INSERT INTO logs (timestamp, type, event, details) VALUES (?, ?, ?, ?)`,
      [logEntry.timestamp, logEntry.type, logEntry.event, logEntry.details],
      function(err) {
        if (err) {
          console.error("Log insert failed:", err);
          resolve({ success: false, error: err.message });
        } else {
          resolve({ success: true });
        }
      }
    );
  });
});
ipcMain.handle("get-logs", (event, limit = 3) => {
  return new Promise((resolve) => {
    db.all(
      "SELECT * FROM logs ORDER BY id DESC LIMIT ?",
      [limit],
      (err, rows) => {
        if (err) {
          console.error("Log retrieval failed:", err);
          resolve([]);
        } else {
          resolve(rows || []);
        }
      }
    );
  });
});

ipcMain.handle("list-sandbox-files", async () => {
    return [
        "sample.py",
        "sample.java",
        "sample.go",
        "sample.rb"
    ];
});
ipcMain.handle("read-sandbox-file", async (event, filename) => {
  const allowedFiles = [
    "sample.py",
    "sample.java",
    "sample.go",
    "sample.rb"
  ];
  if (!allowedFiles.includes(filename)) {
    throw new Error("Access denied");
  }
  const { execFile } = require("child_process");
  return new Promise((resolve) => {
    execFile(
      "python",
      ["Tools/docker_testing.py", "read", filename],
      (error, stdout, stderr) => {
        if (error) {
          console.error("Docker retrieval error:", stderr || error.message);
          resolve("ERROR: Sandbox not available");
          return;
        }
        if (!stdout || stdout.trim().length === 0) {
          console.warn("Docker returned empty output for", filename);
          resolve("ERROR: Sandbox not available");
          return;
        }
        resolve(stdout);
      }
    );
  });
});
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (db) db.close();
  app.quit();
});