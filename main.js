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

ipcMain.handle("get-logs", () => {
  return new Promise((resolve) => {
    db.all(
      "SELECT * FROM logs ORDER BY id DESC",
      function(err, rows) {
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

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (db) db.close();
  app.quit();
});