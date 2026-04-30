// D:\AI_LAB\Database\db.js
const Database = require('better-sqlite3');
const path = require('path');

// Path to logs.db inside Database folder
const dbPath = path.join(__dirname, 'logs.db');
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    type TEXT,
    event TEXT,
    details TEXT
  )
`);

module.exports = db;
