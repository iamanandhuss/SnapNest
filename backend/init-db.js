import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

// ensure we resolve to the same place regardless of where this is run
const dbPath = path.resolve(process.cwd(), 'production.db');
const db = new sqlite3.Database(dbPath);

db.serialize(async () => {
    console.log("🛠️ Initializing database tables...");

    // 1. Admins Table
    db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

    // 2. Events Table
    db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    drive_folder_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

    // 3. Shared Links / Clients Table
    db.run(`CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        name TEXT,
        password TEXT,
        token TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(event_id) REFERENCES events(id)
      )`);

    // 4. Selections Table
    db.run(`CREATE TABLE IF NOT EXISTS selections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    photo_id TEXT,
    UNIQUE(client_id, photo_id),
    FOREIGN KEY(client_id) REFERENCES clients(id)
  )`);

    // Create Default Secure Admin Account (Username: admin, Password: Password123)
    const defaultUser = 'admin';
    const hashedPassword = await bcrypt.hash('Password123', 10);

    db.run(
        `INSERT INTO admins (username, password) VALUES (?, ?) ON CONFLICT(username) DO NOTHING`,
        [defaultUser, hashedPassword],
        (err) => {
            if (err) console.error("Error creating default admin:", err);
            else console.log("✅ Database initialized. Default Admin: admin / Password123");
        }
    );
});
