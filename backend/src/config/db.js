import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On Vercel, the file system is read-only except for /tmp
// We need to copy the bundled database to /tmp to allow SQLite to work
// db.js is at src/config/ so production.db is 2 levels up at the backend project root
const sourceDbPath = path.resolve(__dirname, '../../production.db');
const tmpDbPath = process.env.NODE_ENV === 'production' ? '/tmp/production.db' : sourceDbPath;

if (process.env.NODE_ENV === 'production' && !fs.existsSync(tmpDbPath)) {
    if (fs.existsSync(sourceDbPath)) {
        fs.copyFileSync(sourceDbPath, tmpDbPath);
        console.log('✅ Copied production.db to /tmp/production.db');
    } else {
        console.warn('⚠️ sourceDbPath does not exist:', sourceDbPath);
        console.warn('Creating a fresh empty database in /tmp...');
    }
}

const db = new sqlite3.Database(tmpDbPath);

// Ensure tables exist (idempotent — safe to run on every startup)
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        drive_folder_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS selections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        photo_id TEXT NOT NULL,
        UNIQUE(client_id, photo_id),
        FOREIGN KEY (client_id) REFERENCES clients(id)
    )`);
});

export default db;

