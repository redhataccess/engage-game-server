const path = require("path");
const fs = require("fs");
const gm = require("gm");
const filenamify = require("filenamify");

const NAME = {
  Y: 740,
  SIZE: 84,
  COLOR: "#004b73",
  FONT: path.join(__dirname, "fonts/overpass-extrabold.otf")
};
const WORD_SCORE = {
  Y: NAME.Y + 53,
  SIZE: NAME.SIZE / 2.72,
  COLOR:NAME.COLOR,
  FONT: path.join(__dirname, "fonts/overpass-regular.otf")
};
const SCORE = {
  Y: NAME.Y + NAME.SIZE + WORD_SCORE.SIZE + 25,
  SIZE: NAME.SIZE,
  COLOR: "#0088ce",
  FONT: path.join(__dirname, "fonts/overpass-bold.otf")
};

const OUT_DIR = path.join(__dirname, "./annotated-cards");

const BLANK_CARD = path.join(__dirname, "./card.png");

// turn a string into a safe filename
// const safename = str => asciifold.fold(str, "");
const safename = str => filenamify(str, { replacement: '_' });;

function annotate({ name, score, accountID }) {
  // gm docs: https://www.npmjs.com/package/gm
  return new Promise(resolve => {
    const asciiName = safename(name);
    const outFile = path.join(OUT_DIR, `${asciiName}.png`);
    const scoreString = Intl.NumberFormat('en-US').format(score);
    gm(BLANK_CARD)
      .gravity("North") // center text
      .strokeWidth('0px')

      // annotate name
      .fill(NAME.COLOR)
      .font(NAME.FONT, NAME.SIZE)
      .drawText(0, NAME.Y, asciiName)

      // annotate word 'SCORE'
      .fill(WORD_SCORE.COLOR)
      .font(WORD_SCORE.FONT, WORD_SCORE.SIZE)
      .drawText(0, WORD_SCORE.Y, 'SCORE')

      // annotate score
      .fill(SCORE.COLOR)
      .font(SCORE.FONT, SCORE.SIZE)
      .drawText(0, SCORE.Y, scoreString)

      // write the file
      .write(outFile, err => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(outFile);
        }
      });
  });
}

module.exports = { annotate };

// test code, enabling this file to be executed directly with `node card.js`
if (require.main === module) {
  annotate({ name: "Shadowman", score: Math.floor(Math.random()*8675309) });
  annotate({ name: "Howlongmustafirstnamebe", score: Math.floor(Math.random()*8675309) });
  annotate({ name: "Lauren", score: Math.floor(Math.random()*8675309) });
  annotate({ name: "Jared", score: Math.floor(Math.random()*8675309) });
  annotate({ name: "Aĺĺÿşôň", score: Math.floor(Math.random()*8675309) });
  annotate({ name: "S̰̣̗̲̭̱H̟͙̞̦̥̼A̲̞̠͇͠Ḑ̦̻O̤̝̦̭̗͙͝W̸͓̭̦̟̟̝M͏͉̻̪̞̠̺̖A̖̥̫̯̼̠̹N̶", score: Math.floor(Math.random()*8675309) }); // put the typeface to the test with crazy unicode symbols
}
