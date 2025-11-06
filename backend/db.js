const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        password TEXT NOT NULL
    )`);
    // db.run(`CREATE TABLE IF NOT EXISTS transactions (
    //     id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     user_id INTEGER NOT NULL,
    //     type TEXT NOT NULL,
    //     currency TEXT NOT NULL,
    //     amount REAL,
    //     rate REAL,
    //     date TEXT,
    //     FOREIGN KEY(user_id) REFERENCES users(id)
    //     )`);
});

module.exports = db;