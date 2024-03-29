<img align=center src="https://raw.githubusercontent.com/api-tsukasa/PhotoVoyage/master/.github/assets/banner.png">

PhotoVoyage is an open source web application for hosting photos of any kind can be Travel, countries, Anime, etc. It has a register and login system also with an admin panel to manage the images uploaded on the platform.

Demo: https://photovoyage-main.onrender.com/

---

## rquirements

* [Node.js](https://nodejs.org/en/) - a cross-platform runtime environment
* [Git](https://git-scm.com/downloads) - version control software

## Installation

## Clone the repository with the ``git`` tool
```cmd
> https://github.com/api-tsukasa/PhotoVoyage.git
```
this step is very important for the bot to work that's why you need `git` this step must not be skipped

## Installing Dependencies
```cmd
> npm install
```

## Start Project
```cmd
> npm run dev
```

When you start the server locally, you have to enter the following URL

* http://localhost:3000/ - home page
* http://localhost:3000/admin - Admin Panel

## admins.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<admins>
    <admin>XFkjjp0</admin>
</admins>
```

The first account with an administrator is called `XFkjjp0` but it can be modified until you can add more accounts if you like with the following tag

```xml
    <admin>account name</admin>
```

## Features

* Middleware Setup: The application sets up middleware for various functionalities such as handling file uploads using Multer, sessions using express-session, etc.

* Static File Serving: Static files like CSS files are served using express.static middleware for styling the web pages.

* Session Management: Sessions are managed using express-session middleware. User session data includes information such as username, login status, and isAdmin flag.

* User Authentication: User registration and login functionality are implemented using bcrypt for password hashing and validation.

* Photo Upload: Users can upload photos, and the uploaded photo information is stored in a database. Multer middleware is used for handling file uploads.

* Database Operations: SQLite database is used for storing user and photo information. Database operations are performed using SQLite queries.

* Error Handling: Error pages are rendered when errors occur during processing requests.

* Admin Panel: There's an admin panel accessible only to admin users. Admins can view and manage photos, search for photos by ID, view user details, and delete photos.

* User Management: Admins can view user details and manage users, such as viewing user information and deleting users.

* Logout: Users can log out of their sessions, and session data is cleared.

* Active Users: The application keeps track of active users using a Map data structure.

* Support Links: Support links are provided for GitHub repository and bug reporting.

* Server Start: The server is started, and console logs provide information about server URLs and support links.

# PhotoVoyage-languages App

It is an app developed by the sstudios team with the help of some members of photoVoyage that allows you to download official and community translations for the photoVoyage web app The app has two versions that is programmed the first version is the one that is programmed with python and the second is the java both do the same function but you can use it anyone depends on your taste

Repository: https://github.com/PhotoVoyage/PhotoVoyage-languages

# Discord integration

The photoVoyage open source platform has official discord integration and everything to do with discord will be in the `.env` file.

```env
DISCORD_NOTIFIER_WEBHOOK_URL=YOUR_WEBHOOK_WEB_URL_OF_DISCORD
DISCORD_NOTIFICATIONS_ENABLED=false

DISCORD_LOGGER_WEBHOOK_URL=YOUR_WEBHOOK_WEB_URL_OF_DISCORD
DISCORD_LOGS_ENABLED=false
DISCORD_LOG_INTERVAL=5000
```

# Sponsors

Thank you very much for supporting us in this project ⭐

<a href="https://github.com/Sstudios-Dev"><img src="https://avatars.githubusercontent.com/u/156860248?s=200&v=4" height="128" width="128" /></a>

# Contributors

Thank you very much for helping in the project ❤

<a href="https://github.com/staFF6773"><img src="https://avatars.githubusercontent.com/u/108166164?v=4" height="128" width="128" /></a>
<a href="https://github.com/Sstudiosdev"><img src="https://avatars.githubusercontent.com/u/149289426?v=4" height="128" width="128" /></a>
<a href="https://github.com/StaffV77"><img src="https://avatars.githubusercontent.com/u/107765373?v=4" height="128" width="128" /></a>
<a href="https://github.com/api-tsukasa"><img src="https://avatars.githubusercontent.com/u/142162315?v=4" height="128" width="128" /></a>
<a href="https://github.com/MasterpaintSu"><img src="https://avatars.githubusercontent.com/u/159675013?v=4" height="128" width="128" /></a>
<a href="https://github.com/SantiagolxxGG"><img src="https://avatars.githubusercontent.com/u/149891004?v=4" height="128" width="128" /></a>
<a href="https://github.com/photovoyagehelp"><img src="https://avatars.githubusercontent.com/u/164266627?v=4" height="128" width="128" /></a>
