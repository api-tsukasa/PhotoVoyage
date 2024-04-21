var menuToggle = document.getElementById("menuToggle");
        
menuToggle.addEventListener("click", function() {
    menuToggle.classList.toggle("active");
});

// Event listener for the Upload button
document.getElementById("uploadBtn").addEventListener("click", function() {
    var imageName = prompt("Please enter the name of the image:");
    if (imageName) {
        var imageNameLowerCase = imageName.toLowerCase();
        var forbiddenNames = ["hentai", "rule34", "porhub", "xxx", "xvideos", "xnxx", ".com", ".net", ".org", ".xyz", ".store", ".lat"];

        if (forbiddenNames.includes(imageNameLowerCase)) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'This name is not allowed. Please choose another name.'
            });
            
            return;
        }
        document.getElementById('photoName').value = imageName;
        document.querySelector('.file-input').click();
    }
});

// Event listener for file input change
document.querySelector('.file-input').addEventListener('change', function() {
    // Get the form element
    var form = document.getElementById('uploadForm');
    // Submit the form
    form.submit();
    
    // Fetch the photo name and send it to the server
    var photoName = document.getElementById('photoName').value;
    var formData = new FormData();
    formData.append('photoName', photoName);
    
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Photo uploaded successfully:', data);
    })
    .catch(error => {
        console.error('Error uploading photo:', error);
    });
});

window.onload = () => {
    fetch('/photos')
    .then(response => response.json())
    .then(data => {
        const gallery = document.getElementById('gallery')
        data.forEach(photo => {
            const imgContainer = document.createElement('div');
            imgContainer.classList.add('image-container');

            const img = document.createElement('img');
            const filename = photo.filename.toLowerCase();
            const staticSrc = `/uploads/${filename.split('.')[0]}.gif`;

            if (filename.endsWith('.gif')) {
                img.src = staticSrc;
                img.dataset.src = `/uploads/${filename}`;
                img.loading = 'lazy'; // Lazy loading
            } else {
                img.src = `/uploads/${filename}`;
            }

            img.addEventListener('click', function() {
                const modal = document.getElementById('previewModal');
                const modalImg = document.getElementById('previewImage');
                modal.style.display = 'block';

                // Set the source of the modal image to the original image
                modalImg.src = img.dataset.src || img.src;
            });

            const imageName = document.createElement('div');
            imageName.textContent = photo.name ? photo.name : 'Unknown';
            imgContainer.appendChild(img);
            imgContainer.appendChild(imageName); // Add the image name
            gallery.appendChild(imgContainer);
        });
    })
    .catch(error => console.error('Error fetching photos:', error));
};

let zoomLevel = 1;

document.getElementById('zoomIn').addEventListener('click', function() {
    zoomLevel += 0.1;
    document.getElementById('previewImage').style.transform = `scale(${zoomLevel})`;
});

document.getElementById('zoomOut').addEventListener('click', function() {
    zoomLevel -= 0.1;
    document.getElementById('previewImage').style.transform = `scale(${zoomLevel})`;
});

let currentImageIndex = 0;

document.getElementById('previewModal').addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-img')) {
        currentImageIndex = (currentImageIndex + 1) % data.length;
        displayImage(data[currentImageIndex], currentImageIndex + 1, data.length);
    }
});

function displayImage(photo, current, total) {
    const modalImg = document.getElementById('previewImage');
    const currentImageNumber = document.getElementById('currentImageNumber');
    const totalImages = document.getElementById('totalImages');

    modalImg.src = photo.src;
    modalImg.style.transform = `scale(1)`;
    zoomLevel = 1;
    currentImageNumber.textContent = current;
    totalImages.textContent = total;
}

document.getElementsByClassName('close')[0].addEventListener('click', function() {
    document.getElementById('previewModal').style.display = 'none';
});
