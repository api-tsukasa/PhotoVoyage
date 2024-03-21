// PhotoVoyage
// Code developed by the photoVoyage team and collaborators
// https://github.com/api-tsukasa/PhotoVoyage/graphs/contributors

const fs = require('fs');
const { parseString } = require('xml2js');

function isAdmin(username) {
    const xmlData = fs.readFileSync('private/admins.xml', 'utf8');
    let isAdmin = false;

    parseString(xmlData, (err, result) => {
        if (err) {
            console.error('Failed to parse XML file');
            return;
        }
        const admins = result.admins.admin;
        for (let i = 0; i < admins.length; i++) {
            if (admins[i] === username) {
                isAdmin = true;
                break;
            }
        }
    });

    return isAdmin;
}

module.exports = { isAdmin };
