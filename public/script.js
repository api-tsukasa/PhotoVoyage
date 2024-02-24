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
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (response.status === 200) {
            const uploadedImgContainer = document.getElementById('uploadedImgContainer');
            const uploadedImg = document.createElement('img');
            uploadedImg.src = `/uploads/${data.filename}`;
            uploadedImg.className = 'uploaded-img';
            uploadedImgContainer.appendChild(uploadedImg);
        } else {
            alert('Error uploading photo');
        }
    } catch (error) {
        console.error('Error uploading photo:', error);
    }

});
