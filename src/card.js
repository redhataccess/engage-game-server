const path = require("path");
const fs = require("fs");
const gm = require("gm");
const filenamify = require('filenamify');

const NAME = {
    X: 110,
    Y: 690,
    SIZE: 120,
    FONT: "fonts/overpass-extrabold-italic.otf"
};
const SCORE = { X: 310, Y: 900, SIZE: 150, FONT: "fonts/overpass-bold.otf" };

const OUT_DIR = "./annotated-cards";

const BLANK_CARD = "./card.png";

// turn a string into a safe filename
const safename = str => filenamify(str, { replacement: '_' });

function annotate({ name, score }) {
    // gm docs: https://www.npmjs.com/package/gm
    const outFile = path.join(__dirname, OUT_DIR, `${safename(name)}.png`);
    gm(BLANK_CARD)
        // annotate score
        .font(SCORE.FONT, SCORE.SIZE)
        .drawText(SCORE.X, SCORE.Y, score)
        // annotate name
        .font(NAME.FONT, NAME.SIZE)
        .drawText(NAME.X, NAME.Y, name)
        .write(outFile, err => console.error(err));
}

module.export = { annotate };

// test code, enabling this file to be executed directly with `node card.js`
if (require.main === module) {
    annotate({ name: "Shadowman", score: 8675309 });
    annotate({ name: "Lauren Bristol", score: 8675309 });
    annotate({ name: "Jared Sprague", score: 8675309 });
    annotate({ name: "S̰̣̗̲̭̱H̟͙̞̦̥̼A̲̞̠͇͠Ḑ̦̻O̤̝̦̭̗͙͝W̸͓̭̦̟̟̝M͏͉̻̪̞̠̺̖A̖̥̫̯̼̠̹N̶", score: 8675309 });
}
