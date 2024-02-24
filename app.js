const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Configuración de Multer para subir archivos
const upload = multer({ dest: 'uploads/' });

// Configuración de la motor de plantillas para usar EJS
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Configurar Express para servir archivos estáticos desde la carpeta "uploads"
app.use('/uploads', express.static('uploads'));

// Configuración de la base de datos SQLite
const db = new sqlite3.Database('photos.db');
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS photos (id INTEGER PRIMARY KEY, filename TEXT)');
});

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

// Ruta para mostrar la página principal con la galería de fotos
app.get('/', (req, res) => {
    db.all('SELECT * FROM photos', (err, rows) => {
        if (err) {
            return res.status(500).send('Failed to fetch photos');
        }
        res.render('index', { photos: rows });
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
