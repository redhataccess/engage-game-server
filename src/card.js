const path = require("path");
const fs = require("fs");
const gm = require("gm");
const filenamify = require('filenamify');

const NAME = {
    X: 110,
    Y: 690,
    SIZE: 120,
    FONT: path.join(__dirname, "fonts/overpass-extrabold-italic.otf")
};
const SCORE = { X: 310, Y: 900, SIZE: 150, FONT: path.join(__dirname, "fonts/overpass-bold.otf") };

const OUT_DIR = path.join(__dirname, "./annotated-cards");

const BLANK_CARD = path.join(__dirname, "./card.png");

// turn a string into a safe filename
const safename = str => filenamify(str, { replacement: '_' });

function annotate({ name, score, accountID }) {
    // gm docs: https://www.npmjs.com/package/gm
    return new Promise(resolve => {
        const outFile = path.join(OUT_DIR, `${safename(name)}.png`);
        gm(BLANK_CARD)
            .font(SCORE.FONT, SCORE.SIZE)
            .drawText(SCORE.X, SCORE.Y, score) // annotate score
            .font(NAME.FONT, NAME.SIZE)
            .drawText(NAME.X, NAME.Y, name) // annotate name
            .write(outFile, err => {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                else {
                    resolve(outFile);
                }
            });
    });
}

module.exports = { annotate };

// test code, enabling this file to be executed directly with `node card.js`
if (require.main === module) {
    annotate({ name: "Shadowman", score: 8675309 });
    annotate({ name: "Lauren Bristol", score: 8675309 });
    annotate({ name: "Jared Sprague", score: 8675309 });
    annotate({ name: "S̰̣̗̲̭̱H̟͙̞̦̥̼A̲̞̠͇͠Ḑ̦̻O̤̝̦̭̗͙͝W̸͓̭̦̟̟̝M͏͉̻̪̞̠̺̖A̖̥̫̯̼̠̹N̶", score: 8675309 });
}
