window.onload = () => {
    fetch('/photos')
        .then(response => response.json())
        .then(data => {
            const gallery = document.getElementById('gallery');
            data.forEach(photo => {
                const img = document.createElement('img');
                img.src = `/uploads/${photo.filename}`;
                gallery.appendChild(img);
            });
        })
        .catch(error => console.error('Error fetching photos:', error));
};

// Formulario de subida de fotos
const form = document.querySelector('form');
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(photo => {
            const gallery = document.getElementById('gallery');
            const img = document.createElement('img');
            img.src = `/uploads/${photo.filename}`;
            gallery.appendChild(img);
        })
        .catch(error => console.error('Error uploading photo:', error));
});