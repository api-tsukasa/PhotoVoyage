const sqlite3 = require('sqlite3').verbose();

// SQLite database configuration
const db = new sqlite3.Database('photos.db');
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS photos (id INTEGER PRIMARY KEY, filename TEXT)');
});

// SQLite database configuration for users
const userDB = new sqlite3.Database('users.db');
userDB.serialize(() => {
    userDB.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)');
});

module.exports = { db, userDB };
