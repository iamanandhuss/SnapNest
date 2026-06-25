import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On Vercel, the file system is read-only except for /tmp
// We need to copy the bundled database to /tmp to allow SQLite to work
const sourceDbPath = path.resolve(__dirname, '../../production.db');
const tmpDbPath = process.env.NODE_ENV === 'production' ? '/tmp/production.db' : sourceDbPath;

if (process.env.NODE_ENV === 'production' && !fs.existsSync(tmpDbPath)) {
    if (fs.existsSync(sourceDbPath)) {
        fs.copyFileSync(sourceDbPath, tmpDbPath);
    } else {
        console.warn("sourceDbPath does not exist:", sourceDbPath);
    }
}

const db = new sqlite3.Database(tmpDbPath);

export default db;
