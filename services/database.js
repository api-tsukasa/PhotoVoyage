// PhotoVoyage
// Code developed by the photoVoyage team and collaborators
// https://github.com/api-tsukasa/PhotoVoyage/graphs/contributors

const colors = require('colors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const databaseFolder = 'Database';
const photosDBPath = path.join(databaseFolder, 'photos.db');
const usersDBPath = path.join(databaseFolder, 'users.db');

const fs = require('fs');
if (!fs.existsSync(databaseFolder)) {
    fs.mkdirSync(databaseFolder);
    console.log('📁 Database folder created.'.green);
}

const db = new sqlite3.Database(photosDBPath);
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS photos (id INTEGER PRIMARY KEY, filename TEXT, name TEXT)');
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
            console.error('❌ Error getting table count for photos.db:'.red, err);
        } else {
            console.log('✅ Photos database initialized with'.green, String(tables.length).yellow, 'table(s).'.green);
        }
    });
});

const userDB = new sqlite3.Database(usersDBPath);
userDB.serialize(() => {
    userDB.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, email TEXT, password TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
    userDB.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
            console.error('❌ Error getting table count for users.db:'.red, err);
        } else {
            console.log('✅ Users database initialized with'.green, String(tables.length).yellow, 'table(s).'.green);
        }
    });
});

module.exports = { db, userDB };
