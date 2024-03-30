// photoVoyage
// code developed by the photoVoyage team and collaborators
// https://github.com/api-tsukasa/PhotoVoyage/graphs/contributors

const fs = require('fs');
const { parseString } = require('xml2js');

function isMod(username) {
    const xmlDate = fs.readFileSync('private/mods.xml', 'utf-8');
    let isMod = false;

    parseString(xmlDate, (err, result) => {
        if (err) {
            console.error('Faild to parse XML file');
            return;
        }
        const mods = result.mods.mod;
        for (let i = 0; i < mods.length; i++) {
            if (mods[i] === username) {
                isMod = true;
                break
            }
        }
    });

    return isMod;
}

module.exports = { isMod };
