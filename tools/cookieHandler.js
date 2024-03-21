const cookieParser = require('cookie-parser');

function configureCookieParser(app) {
    app.use(cookieParser());
}

function setLoggedInUserCookie(res, username, expires) {
    res.cookie('loggedInUser', username, { expires: expires, httpOnly: true });
}

module.exports = {
    configureCookieParser,
    setLoggedInUserCookie
};
