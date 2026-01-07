const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite');
const currencies = require('./currencies.json');

function dbGet(query, params = []) {
    return new Promise((resolve, reject) => {
        db.get(query, params, (error, row) => {
            if (error) reject(error);
            else resolve(row);
        });
    });
}
function dbAll(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (error, rows) => {
            if (error) reject(error);
            else resolve(rows);
        });
    });
}

function dbRun(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (error) {
            if (error) reject(error);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        password TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS wallets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS currencies (
        code TEXT PRIMARY KEY,
        name TEXT,
        symbol TEXT,
        flag TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS currency_wallets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_id INTEGER NOT NULL,
        currency TEXT NOT NULL,
        amount REAL,
        FOREIGN KEY(wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
        FOREIGN KEY(currency) REFERENCES currencies(code)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        from_currency TEXT,
        to_currency TEXT,
        from_amount REAL,
        to_amount REAL,
        rate REAL,
        date TEXT,
        FOREIGN KEY(wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
        FOREIGN KEY(from_currency) REFERENCES currencies(code),
        FOREIGN KEY(to_currency) REFERENCES currencies(code)
    )`);
});

for (const currency of currencies) {
    db.run('INSERT OR IGNORE INTO currencies (code, name, symbol, flag) VALUES (?, ?, ?, ?)', [currency.code, currency.name, currency.symbol, currency.flag]);
}

module.exports = { db, dbGet, dbAll, dbRun };