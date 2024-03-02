const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const { parseString } = require('xml2js');
const { createCanvas } = require('canvas');
const canvas = createCanvas(200, 50);
const ctx = canvas.getContext('2d');

const app = express();
const port = 3000;

function generateCaptcha() {
    const operators = ['+', '-', '*'];
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    const operator = operators[Math.floor(Math.random() * operators.length)];
    const question = `${num1} ${operator} ${num2}`;
    let answer;
    switch (operator) {
        case '+':
            answer = num1 + num2;
            break;
        case '-':
            answer = num1 - num2;
            break;
        case '*':
            answer = num1 * num2;
            break;
    }
    return { question: question, answer: answer };
}

// Multer configuration for uploading files
const upload = multer({ dest: 'uploads/' });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuration of the template engine to use EJS
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// CSS configuration
app.get('/public/styles.css', function(req, res) {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(__dirname + '/public/styles.css');
});

// error-page css
app.get('/public/error-page.css', function(req, res) {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(__dirname + '/public/error-page.css');
});

// admin css
app.get('/public/admin.css', function(req, res) {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(__dirname + '/public/admin.css');
});

// login && Register css
app.get('/public/login.css', function(req, res) {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(__dirname + '/public/login.css');
});

// admin-users css
app.get('/public/admin-user.css', function(req, res) {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(__dirname + '/public/admin-user.css');
});

// user-details.css
app.get('/public/user-details.css', function(req, res) {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(__dirname + '/public/user-details.css');
});

// Configure Express to serve static files from the "uploads" folder
app.use('/uploads', express.static('uploads'));

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

// Middleware configuration for sessions
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));

// Función para verificar si el usuario es un administrador
function isAdmin(username) {
    const xmlData = fs.readFileSync('private/admins.xml', 'utf8'); // Change the path to 'private/admins.xml'
    let isAdmin = false;

    parseString(xmlData, (err, result) => {
        if (err) {
            console.error('Failed to parse XML file');
            return;
        }
        const admins = result.admins.admin;
        for (let i = 0; i < admins.length; i++) {
            if (admins[i] === username) {
                isAdmin = true;
                break;
            }
        }
    });

    return isAdmin;
}

// Protect routes that require login
function requireLogin(req, res, next) {
    if (req.session.isLoggedIn) {
        if (isAdmin(req.session.username)) {
            return next();
        } else {
            res.status(403).redirect('/error');
        }
    }
    res.redirect('/login');
}

// user register
app.post('/register', async (req, res) => {
    const { username, password, captcha, answer } = req.body;
    const actualAnswer = req.session.captcha;

    if (parseInt(captcha) !== actualAnswer) {
        req.session.message = 'Incorrect answer, please try again.';
        return res.redirect('/register');
    }

    userDB.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
        if (err) {
            res.status(500).redirect('/error');
        }
        if (row) {
            res.status(400).redirect('/error');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        userDB.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
            if (err) {
                res.status(500).redirect('/error');
            }
            res.redirect('/login');
        });
    });
});

// Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    userDB.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
        if (err) {
            res.status(500).redirect('/error');
        }
        if (!row) {
            // User not found, redirect to error page or login page with an error message
            res.status(401).redirect('/error');
        } else {
            const isValidPassword = await bcrypt.compare(password, row.password);
            if (!isValidPassword) {
                // Invalid password, redirect to error page or login page with an error message
                res.status(401).redirect('/error');
            } else {
                req.session.isLoggedIn = true;
                req.session.username = username;
                req.session.isAdmin = isAdmin(username); // Set isAdmin flag based on user role
                res.redirect('/');
            }
        }
    });
});

// logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Route to upload photos
app.post('/upload', upload.single('photo'), (req, res) => {
    const photo = req.file;
    if (!photo) {
        res.status(400).redirect('/error');
    }

    db.run('INSERT INTO photos (filename) VALUES (?)', [photo.filename], (err) => {
        if (err) {
            res.status(500).redirect('/error');
        }

        // Get the information of the photo just uploaded
        db.get('SELECT * FROM photos WHERE id = ?', [this.lastID], (err, row) => {
            if (err) {
                res.status(500).redirect('/error');
            }

            res.redirect('/');
        });
    });
});

// Path to get the list of photos
app.get('/photos', (req, res) => {
    db.all('SELECT * FROM photos', (err, rows) => {
        if (err) {
            res.status(500).redirect('/error');
        }
        res.json(rows);
    });
});

app.get('/login', (req, res) => {
    res.render('login', { message: req.session.message });
});

app.use((req, res, next) => {
    delete req.session.message;
    next();
});

// Path to display the registration page
app.get('/register', (req, res) => {
    const captcha = generateCaptcha();
    req.session.captcha = captcha.answer;
    res.render('register', { message: req.session.message, captcha: { question: captcha.question, answer: captcha.answer } });
});

// Path to display the main page with the photo gallery
app.get('/', (req, res) => {
    db.all('SELECT * FROM photos', (err, rows) => {
        if (err) {
            res.status(500).redirect('/error');
        }
        const isLoggedIn = req.session.isLoggedIn;
        const username = req.session.username;
        const isAdmin = req.session.isAdmin || false; // Check if isAdmin is set in session, default to false if not set
        res.render('index', { photos: rows, isLoggedIn: isLoggedIn, isAdmin: isAdmin });
    });
});


// path to display the error page
app.get('/error', (req, res) => {
    res.render('error');
});

// Path to the administrators panel
app.get('/admin', requireAdmin, (req, res) => {
    db.all('SELECT * FROM photos', (err, rows) => {
        if (err) {
            res.status(500).redirect('/error');
        }
        res.render('admin', { photos: rows });
    });
});

// Middleware to verify if the user is an administrator
function requireAdmin(req, res, next) {
    if (req.session.isLoggedIn && isAdmin(req.session.username)) {
        return next();
    } else {
        res.status(403).redirect('/error');
    }
}

// Path to search for a photo by ID
app.get('/admin/search', requireLogin, (req, res) => {
    const id = req.query.id;
    if (!id) {
        return res.redirect('/admin');
    }

    db.get('SELECT * FROM photos WHERE id = ?', id, (err, row) => {
        if (err || !row) {
            res.status(404).redirect('/error');
        }
        res.render('search', { photo: row });
    });
});

// Path to display the user administration page
app.get('/admin-users', requireLogin, (req, res) => {
    userDB.all('SELECT * FROM users', (err, rows) => {
        if (err) {
            res.status(500).redirect('/error');
        }
        res.render('admin-users', { users: rows });
    });
});

// Path to get a user's information by ID and display it on a separate page
app.get('/admin-users/:id', requireLogin, (req, res) => {
    const userId = req.params.id;
    userDB.get('SELECT * FROM users WHERE id = ?', userId, (err, row) => {
        if (err || !row) {
            res.status(404).redirect('/error');
        }
        res.render('user-details', { user: row, userId: userId });
    });
});

// Path to delete a photo
app.post('/admin/delete/:id', requireLogin, (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM photos WHERE id = ?', id, (err, row) => {
        if (err || !row) {
            res.status(404).redirect('/error');
        }
        const filename = row.filename;
        fs.unlink(`uploads/${filename}`, (err) => {
            if (err) {
                res.status(500).redirect('/error');
            }
            db.run('DELETE FROM photos WHERE id = ?', id, (err) => {
                if (err) {
                    res.status(500).redirect('/error');
                }
                res.redirect('/admin');
            });
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`The local server is being turned on please log in to the web from these links`)
    console.log(``)
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Admin Server running at http://localhost:${port}/admin`);
    console.log(``)
    console.log(`Support:`)
    console.log(`Github: https://github.com/api-tsukasa/PhotoVoyage/`)
    console.log(`Report bugs: https://github.com/api-tsukasa/PhotoVoyage/issues`)
});
