interface Photo {
    filename: string;
}

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menuToggle") as HTMLElement;
    const menuIcon = document.getElementById("menuIcon") as HTMLElement;
    const gallery = document.getElementById('gallery') as HTMLElement;

    // Agregar un evento de clic al botón de menú
    menuToggle.addEventListener("click", () => {
        // Alternar la clase 'active' en el botón de menú
        menuToggle.classList.toggle("active");
    });

    // Cargar las fotos al cargar la página
    fetch('/photos')
        .then(response => response.json())
        .then((data: Photo[]) => {
            data.forEach(photo => {
                const img = document.createElement('img');
                img.src = `/uploads/${photo.filename}`;
                img.addEventListener('click', function() {
                    const modal = document.getElementById('previewModal') as HTMLElement;
                    const modalImg = document.getElementById('previewImage') as HTMLImageElement;
                    modal.style.display = 'block';
                    modalImg.src = this.src;
                });
                gallery.appendChild(img);
            });
        })
        .catch(error => console.error('Error fetching photos:', error));

    // Cerrar la ventana modal al hacer clic en el botón de cerrar
    document.getElementsByClassName('close')[0].addEventListener('click', () => {
        const previewModal = document.getElementById('previewModal') as HTMLElement;
        previewModal.style.display = 'none';
    });
});
