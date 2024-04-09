// PhotoVoyage
// Code developed by the photoVoyage team and collaborators
// https://github.com/api-tsukasa/PhotoVoyage/graphs/contributors

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const sqlite3 = require('sqlite3');
const { performance } = require('perf_hooks');

const generateCaptcha = require('./services/captchaS');
const { db, userDB } = require('./services/database');
const { isAdmin } = require('./tools/adminUtils');
const { configureCookieParser, setLoggedInUserCookie } = require('./tools/cookieHandler');
const fileFilter = require('./tools/fileFilter');
const { sendDiscordNotification, setNotifications } = require('./services/discordNotifier');
const { logMiddleware } = require('./services/DiscordLogger');
const activeUsers = new Map();

const app = express();
const port = 3000;
configureCookieParser(app);
app.use(logMiddleware);

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 2 * 24 * 60 * 60 * 1000 } // 2 day expiration
}));

// Multer configuration for uploading files
const upload = multer({
    dest: 'uploads/',
    fileFilter: fileFilter
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuration of the template engine to use EJS
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Button component
app.get('/public/Components/buttons.css', function(req, res) {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(__dirname + '/public/Components/buttons.css');
});

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

// active-users.css
app.get('/public/active-users.css', function(req, res) {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(__dirname + '/public/active-users.css');
});

// tools.css
app.get('/public/tools.css', function(req, res) {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(__dirname + '/public/tools.css');
});

// Configure Express to serve static files from the "uploads" folder
app.use('/uploads', express.static('uploads'));

// Middleware configuration for sessions
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));

// Protect routes that require login
function requireLogin(req, res, next) {
    if (req.cookies.loggedInUser) {
        if (isAdmin(req.cookies.loggedInUser)) {
            return next();
        } else {
            res.status(403).redirect('/error');
        }
    }
    res.redirect('/login');
}

// user register
app.post('/register', async (req, res) => {
    const { username, email, password, captcha, answer } = req.body;
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
        userDB.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], (err) => {
            if (err) {
                res.status(500).redirect('/error');
            }
            res.redirect('/login');
        });
    });
});

// login
app.post('/login', async (req, res) => {
    const twoDaysInMilliseconds = 2 * 24 * 60 * 60 * 1000;
    const expirationDate = new Date(Date.now() + twoDaysInMilliseconds);
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
                // Set a cookie named 'loggedInUser' with the username
                setLoggedInUserCookie(res, username, expirationDate);
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
    const photoName = req.body.photoName;

    if (!photo || !photoName) {
        res.status(400).redirect('/error');
    } else {
        if (photo.filename) {
            db.run('INSERT INTO photos (filename, name) VALUES (?, ?)', [photo.filename, photoName], (err) => {
                if (err) {
                    res.status(500).redirect('/error');
                } else {
                    const photoURL = `http://localhost:${port}/uploads/${photo.filename}.png`;
                    sendDiscordNotification(photoName, photoURL);

                    res.redirect('/');
                }
            });
        } else {
            res.status(400).redirect('/error'); // Handle the case where photo.filename is undefined
        }
    }

    if (req.fileValidationError) {
        return res.status(400).send(req.fileValidationError);
    }
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
    if (req.session.isLoggedIn) {
        activeUsers.set(req.session.username, true);
    }

    next();
});

app.use('/logout', (req, res, next) => {
    if (req.session.isLoggedIn) {
        activeUsers.delete(req.session.username);
    }
    next();
});

app.get('/active-users', (req, res) => {
    const activeUsersCount = activeUsers.size;
    const isLoggedIn = req.session.isLoggedIn;
    const isAdmin = req.session.isAdmin;
    res.render('active-users', { activeUsersCount: activeUsersCount, isLoggedIn: isLoggedIn, isAdmin: isAdmin });
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
        const activeUsersCount = activeUsers.size;
        const isAdmin = req.session.isAdmin || false; // Check if isAdmin is set in session, default to false if not set
        res.render('index', { photos: rows, isLoggedIn: isLoggedIn, isAdmin: isAdmin, activeUsersCount: activeUsersCount });
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

// Route to analyze the database folder
app.get('/analyze-database-folder', (req, res) => {
    const folderPath = 'Database'; // Database folder path
    let results = [];
    const startTime = performance.now();

    // Get the list of files in the folder
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            res.status(500).send('Error reading the database folder');
            return;
        }

        // Iterate over each file and analyze it
        files.forEach((file) => {
            const dbPath = path.join(folderPath, file);
            const dbSize = fs.statSync(dbPath).size;

            console.log(`Analyzing file: ${file}, Size: ${dbSize} bytes`);

            const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
                if (err) {
                    console.log(`Error opening the database ${file}`);
                    results.push({ filename: file, size: dbSize, corrupt: true });
                    checkIfFinished(files.length);
                    return;
                }

                // Execute a query to check for corrupt files
                db.get('PRAGMA integrity_check;', (err, row) => {
                    if (err) {
                        console.log(`Error checking the integrity of the database ${file}`);
                        results.push({ filename: file, size: dbSize, corrupt: true });
                    } else {
                        const isCorrupt = row.integrity_check === 'ok' ? false : true;
                        if (isCorrupt) {
                            console.log(`Corrupt file found: ${file}`);
                        } else {
                            console.log(`File analyzed successfully: ${file}`);
                        }
                        results.push({ filename: file, size: dbSize, corrupt: isCorrupt });
                    }
                    checkIfFinished(files.length, startTime);
                });

                // Close the database after executing the query
                db.close();
            });
        });
    });

    function checkIfFinished(totalFiles, startTime) {
        if (results.length === totalFiles) {
            const endTime = performance.now();
            const elapsedTime = endTime - startTime;
            console.log(`Total analysis time: ${elapsedTime} milliseconds`);

            console.log('--- Analysis Results ---');
            results.forEach((result) => {
                console.log(`File: ${result.filename}, Size: ${result.size} bytes, Corrupt: ${result.corrupt ? 'Yes' : 'No'}`);
            });
            res.json({ results, elapsedTime });
        }
    }
});

app.get('/tools', (req, res) => {
    res.render('tools');
})

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
app.get('/admin-users', requireAdmin, (req, res) => {
    userDB.all('SELECT * FROM users', (err, rows) => {
        if (err) {
            res.status(500).redirect('/error');
        }
        res.render('admin-users', { users: rows });
    });
});

// Path to get a user's information by ID and display it on a separate page
app.get('/admin-users/:id', requireAdmin, (req, res) => {
    const userId = req.params.id;
    userDB.get('SELECT * FROM users WHERE id = ?', userId, (err, row) => {
        if (err || !row) {
            res.status(404).redirect('/error');
        }
        res.render('user-details', { user: row, userId: userId });
    });
});

// Path to delete a photo
app.post('/admin/delete/:id', requireAdmin, (req, res) => {
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