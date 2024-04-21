// Get the menu toggle element
var menuToggle = document.getElementById("menuToggle");

// Add event listener to toggle the "active" class on menu toggle click
menuToggle.addEventListener("click", function() {
    menuToggle.classList.toggle("active");
});

// Event listener for the Upload button
document.getElementById("uploadBtn").addEventListener("click", function() {
    // Prompt user to enter image name
    var imageName = prompt("Please enter the name of the image:");
    if (imageName) {
        // Convert image name to lowercase
        var imageNameLowerCase = imageName.toLowerCase();
        // List of forbidden image names
        var forbiddenNames = ["hentai", "rule34", "porhub", "xxx", "xvideos", "xnxx", ".com", ".net", ".org", ".xyz", ".store", ".lat"];

        // Check if entered name is forbidden
        if (forbiddenNames.includes(imageNameLowerCase)) {
            // Alert user about forbidden name
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'This name is not allowed. Please choose another name.'
            });
            
            return;
        }
        // Set value of photoName input field
        document.getElementById('photoName').value = imageName;
        // Trigger file input click event
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

// Fetch photos from the server and display them in the gallery
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

            // Load images lazily
            if (filename.endsWith('.gif')) {
                img.src = staticSrc;
                img.dataset.src = `/uploads/${filename}`;
                img.loading = 'lazy';
            } else {
                img.src = `/uploads/${filename}`;
            }

            // Add click event listener to open preview modal
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
            imgContainer.appendChild(imageName);
            gallery.appendChild(imgContainer);
        });
    })
    .catch(error => console.error('Error fetching photos:', error));
};

// Zoom functionality for preview image
let zoomLevel = 1;

document.getElementById('zoomIn').addEventListener('click', function() {
    zoomLevel += 0.1;
    document.getElementById('previewImage').style.transform = `scale(${zoomLevel})`;
});

document.getElementById('zoomOut').addEventListener('click', function() {
    zoomLevel -= 0.1;
    document.getElementById('previewImage').style.transform = `scale(${zoomLevel})`;
});

// Preview modal click event listener to cycle through images
let currentImageIndex = 0;

document.getElementById('previewModal').addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-img')) {
        currentImageIndex = (currentImageIndex + 1) % data.length;
        displayImage(data[currentImageIndex], currentImageIndex + 1, data.length);
    }
});

// Function to display image in the preview modal
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

// Event listener to close the preview modal
document.getElementsByClassName('close')[0].addEventListener('click', function() {
    document.getElementById('previewModal').style.display = 'none';
});

// Function to check if it's the user's first visit
function isFirstVisit() {
    return !localStorage.getItem('visited');
}

// Function to show welcome modal on first visit
function showWelcomeModal() {
    const welcomeModal = document.getElementById('welcomeModal');
    welcomeModal.style.display = 'block';
}

// Function to hide welcome modal and set visited flag
function hideWelcomeModal() {
    const welcomeModal = document.getElementById('welcomeModal');
    welcomeModal.style.display = 'none';
    localStorage.setItem('visited', true);
}

// Show welcome modal on first visit
window.onload = function() {
    if (isFirstVisit()) {
        showWelcomeModal();
    }
};

// Event listener to close welcome modal
document.getElementById('closeWelcomeModal').addEventListener('click', function() {
    hideWelcomeModal();
});
