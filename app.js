const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const port = 3000;

// Configuración de Multer para subir archivos
const upload = multer({ dest: 'uploads/' });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de la motor de plantillas para usar EJS
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Configuracion del CSS
app.get('/public/styles.css', function(req, res) {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(__dirname + '/public/styles.css');
});

// admin css
app.get('/public/admin.css', function(req, res) {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(__dirname + '/public/admin.css');
});

// Configurar Express para servir archivos estáticos desde la carpeta "uploads"
app.use('/uploads', express.static('uploads'));

// Configuración de la base de datos SQLite
const db = new sqlite3.Database('photos.db');
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS photos (id INTEGER PRIMARY KEY, filename TEXT)');
});

// Configuración de la base de datos SQLite para los usuarios
const userDB = new sqlite3.Database('users.db');
userDB.serialize(() => {
    userDB.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)');
});

// Configurar middleware para sesiones
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));

// Registro de usuario
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    userDB.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
        if (err) {
            return res.status(500).send('Failed to register user');
        }
        res.redirect('/login');
    });
});

// Inicio de sesión
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    userDB.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
        if (err || !row) {
            return res.status(401).send('Invalid username or password');
        }
        const isValidPassword = await bcrypt.compare(password, row.password);
        if (!isValidPassword) {
            return res.status(401).send('Invalid username or password');
        }
        req.session.isLoggedIn = true;
        req.session.username = username;
        res.redirect('/');
    });
});

// Cierre de sesión
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Proteger rutas que requieren inicio de sesión
function requireLogin(req, res, next) {
    if (req.session.isLoggedIn) {
        return next();
    }
    res.redirect('/login');
}

// Ruta para subir fotos
app.post('/upload', upload.single('photo'), (req, res) => {
    const photo = req.file;
    if (!photo) {
        return res.status(400).send('No file uploaded');
    }

    db.run('INSERT INTO photos (filename) VALUES (?)', [photo.filename], (err) => {
        if (err) {
            return res.status(500).send('Failed to upload photo');
        }

        // Obtener la información de la foto recién subida
        db.get('SELECT * FROM photos WHERE id = ?', [this.lastID], (err, row) => {
            if (err) {
                return res.status(500).send('Failed to fetch photo');
            }

            // Redirigir a la página principal
            res.redirect('/');
        });
    });
});

// Ruta para obtener la lista de fotos
app.get('/photos', (req, res) => {
    db.all('SELECT * FROM photos', (err, rows) => {
        if (err) {
            return res.status(500).send('Failed to fetch photos');
        }
        res.json(rows);
    });
});

// Ruta para mostrar la página de inicio de sesión
app.get('/login', (req, res) => {
    res.render('login', { message: req.session.message });
});

// Limpiar el mensaje de sesión después de mostrarlo
app.use((req, res, next) => {
    delete req.session.message;
    next();
});

// Ruta para mostrar la página de registro
app.get('/register', (req, res) => {
    res.render('register', { message: req.session.message });
});

// Ruta para mostrar la página principal con la galería de fotos
app.get('/', (req, res) => {
    db.all('SELECT * FROM photos', (err, rows) => {
        if (err) {
            return res.status(500).send('Failed to fetch photos');
        }
        res.render('index', { photos: rows });
    });
});

// Ruta para el panel de administradores
app.get('/admin', (req, res) => {
    db.all('SELECT * FROM photos', (err, rows) => {
        if (err) {
            return res.status(500).send('Failed to fetch photos');
        }
        res.render('admin', { photos: rows });
    });
});

// Ruta para buscar una foto por ID
app.get('/admin/search', (req, res) => {
    const id = req.query.id;
    if (!id) {
        return res.redirect('/admin');
    }

    db.get('SELECT * FROM photos WHERE id = ?', id, (err, row) => {
        if (err || !row) {
            return res.status(404).send('Photo not found');
        }
        res.render('search', { photo: row });
    });
});

// Ruta para eliminar una foto
app.post('/admin/delete/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM photos WHERE id = ?', id, (err, row) => {
        if (err || !row) {
            return res.status(404).send('Photo not found');
        }
        const filename = row.filename;
        fs.unlink(`uploads/${filename}`, (err) => {
            if (err) {
                return res.status(500).send('Failed to delete photo file');
            }
            db.run('DELETE FROM photos WHERE id = ?', id, (err) => {
                if (err) {
                    return res.status(500).send('Failed to delete photo from database');
                }
                res.redirect('/admin');
            });
        });
    });
});

// Iniciar el servidor
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
