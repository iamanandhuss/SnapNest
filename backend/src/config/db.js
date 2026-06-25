import sqlite3 from 'sqlite3';
import path from 'path';

// Resolve the absolute path to production.db to ensure it works regardless of cwd
const dbPath = path.resolve(process.cwd(), 'production.db');
const db = new sqlite3.Database(dbPath);

export default db;
