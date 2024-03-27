// PhotoVoyage
// Code developed by the photoVoyage team and collaborators
// https://github.com/api-tsukasa/PhotoVoyage/graphs/contributors

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const databaseFolder = 'Database';
const photosDBPath = path.join(databaseFolder, 'photos.db');
const usersDBPath = path.join(databaseFolder, 'users.db');

const fs = require('fs');
if (!fs.existsSync(databaseFolder)) {
    fs.mkdirSync(databaseFolder);
}

const db = new sqlite3.Database(photosDBPath);
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS photos (id INTEGER PRIMARY KEY, filename TEXT, name TEXT)');
});

const userDB = new sqlite3.Database(usersDBPath);
userDB.serialize(() => {
    userDB.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, email TEXT, password TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
});

module.exports = { db, userDB };
