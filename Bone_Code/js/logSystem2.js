// D:\AI_LAB\Bone_Code\js\logSystem.js
const Database = require('better-sqlite3');
const path = require('path');

// Path to log_events.db
const dbPath = path.join(__dirname, '../../Database/log_events.db');
const db = new Database(dbPath);

// Initialize schema once
db.exec(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    type TEXT,
    event TEXT,
    details TEXT
  )
`);

let developMode = false;

// Toggle develop mode
function enableDevelopMode() { developMode = true; }
function disableDevelopMode() { developMode = false; }

// Core log function
function addLog(entry) {
  if (!developMode) return; // Only log in develop mode

  const logEntry = {
    timestamp: new Date().toISOString(),
    type: entry.type,
    event: entry.event,
    details: JSON.stringify(entry.details)
  };

  try {
    const stmt = db.prepare(`
      INSERT INTO logs (timestamp, type, event, details)
      VALUES (@timestamp, @type, @event, @details)
    `);
    stmt.run(logEntry);

    // Dispatch to bottom console (custom console panel)
    const consolePanel = document.getElementById('bottom-console');
    if (consolePanel) {
      const line = document.createElement('div');
      line.textContent = `[${logEntry.timestamp}] ${logEntry.type} - ${logEntry.event}: ${logEntry.details}`;
      consolePanel.appendChild(line);
    }
  } catch (err) {
    console.error('Log insert failed:', err);
  }
}

// Capture click events
document.addEventListener('click', (e) => {
  addLog({
    type: 'CLICK',
    event: 'ui',
    details: { target: e.target.id || e.target.tagName }
  });
});

// Capture user messages
function captureUserMessage(content, index) {
  addLog({
    type: 'USER_MESSAGE',
    event: `message_${index}`,
    details: { content, number: index }
  });
}

// Capture AI messages
function captureAIMessage(content, index) {
  addLog({
    type: 'AI_MESSAGE',
    event: `message_${index}`,
    details: { content, number: index }
  });
}

// Capture errors with file + line
window.addEventListener('error', (err) => {
  addLog({
    type: 'ERROR',
    event: 'runtime',
    details: {
      message: err.message,
      file: err.filename || 'unknown',
      line: err.lineno || 'unknown'
    }
  });
});

module.exports = {
  enableDevelopMode,
  disableDevelopMode,
  captureUserMessage,
  captureAIMessage,
  addLog
};
