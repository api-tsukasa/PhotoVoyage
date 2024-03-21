// PhotoVoyage
// Code developed by the photoVoyage team and collaborators
// https://github.com/api-tsukasa/PhotoVoyage/graphs/contributors

interface Photo {
    id: number;
    filename: string;
}

const photos: Photo[] = [
    { id: 1, filename: "photo1.jpg" },
    { id: 2, filename: "photo2.jpg" },
    // Agrega más fotos si es necesario
];

function generateAdminPanel(photos: Photo[]): string {
    let adminPanelHTML: string = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Panel</title>
            <link rel="stylesheet" href="/public/admin.css">
        </head>
        <body>
            <h1>Admin Panel</h1>
            <ul>`;

    photos.forEach(photo => {
        adminPanelHTML += `
                <li>
                    <img src="/uploads/${photo.filename}" alt="Photo" id="photo_${photo.id}">
                    <p>File Name: ${photo.filename}</p>
                    <p>ID: ${photo.id}</p>
                    <form action="/admin/delete/${photo.id}" method="post">
                        <button type="submit">Delete</button>
                    </form>
                </li>`;
    });

    adminPanelHTML += `
            </ul>
        </body>
        </html>`;

    return adminPanelHTML;
}

// Ejemplo de uso
const adminPanel: string = generateAdminPanel(photos);
console.log(adminPanel); // Esto imprimirá el HTML del panel de administración en la consola
