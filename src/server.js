const Hapi = require('hapi');
const nodemailer = require('nodemailer');
const card = require('./card.js');
const { exec } = require('child_process');
const fetch = require('node-fetch');

const PRINT_TYPES = {
    FULL_CARD: Symbol('fullcard'),
    JUST_ANNOTATION: Symbol('just-annotation')
};

const PRINT_TYPE = PRINT_TYPES.JUST_ANNOTATION;
const DO_PRINT = false;

const PARSE_URL = 'http://localhost:1337';

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'jared@scripta.co',
        pass: process.env.SMTP_PASS,
    }
});

// Create a server with a host and port
const server = new Hapi.server({
    port: process.env.PORT || 8000,
    routes: { cors: true }
});

// Add routes
server.route([
    {
        method: 'GET',
        path: '/hello',
        handler: function (request, reply) {
            return reply('hello world');
        }
    },
    {
        method: 'POST',
        path: '/sendMessage',
        handler: postHandler,
    },
    {
        method: 'POST',
        path: '/playerScore',
        handler: playerScoreHandler,
    }
]);

function postHandler(request, reply) {
    let from = '"Engage Game" <jared@scripta.co>';

    console.log("--------- Sending message ---------");
    console.log("From: ", from);
    console.log("To: ", request.payload.to);
    console.log("Subject: ", request.payload.subject);
    console.log("Text: ", request.payload.text);

    // setup email data with unicode symbols
    let mailOptions = {
        from: from,
        to: request.payload.to,
        subject: request.payload.subject,
        text: request.payload.text
    };

    // send mail
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });

    return 'Sending Message';
}

async function playerScoreHandler(request, reply) {
    let player = request.payload;
    console.log("Player score received:", player);


    let playerName = player.Firstname;
    if (playerName === 'Lexy') {
        playerName = 'Thanks Tyler!'
    }
    else if (playerName === 'Mercedes') {
        playerName = 'Thanks Krystal!'
    }

    const cardFiles = await card.annotate({
        name: playerName || "NONAME",
        score: player.score || "NOSCORE",
        accountID: player.AccountId || "NOID"
    });

    let cardToPrint;

    // decide here whether to print just the annotation or the full card
    if (PRINT_TYPE === PRINT_TYPES.FULL_CARD) {
        cardToPrint = cardFiles.fullCard;
    }
    else if (PRINT_TYPE === PRINT_TYPES.JUST_ANNOTATION) {
        cardToPrint = cardFiles.annotationOnly;
    }

    printCard(cardToPrint);
    saveScore(player.AccountId, player.Firstname, player.Email, player.score);

    return { message: `printing .${cardToPrint.replace(__dirname, '')}` };
}

function printCard(card) {
    console.log(`printing ${card}`);

    const command = `lpr -o media=Custom.5x7in "${card}"`;

    console.log("Executing print command:", command);

    if (DO_PRINT) {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`printing error: ${error}`);
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log('lpr command executed successfully');
        });
    }
}


function saveScore(AccountId, name, email, score) {
    console.log('Saving score to parse');

    // Make sure AccountId is a number
    AccountId = +AccountId;

    // remove < characters to prevent any chance of xss attack
    name = name.replace(/</g , "");
    email = email.replace(/</g , "");

    // also make max length for names and emails
    name = name.substr(0, 50);
    email = email.substr(0, 50);

    return fetch(
        PARSE_URL + '/parse/classes/leaders',
        {
            method: 'POST',
            headers: {
                'X-Parse-Application-Id': 'ENGAGE',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ AccountId, name, score, email }),
        }
    ).then(response => {
        response.json();
        console.log("Score save status: ", response.status);

        if (response.ok) {
            console.log('Score saved');
        }
    });
}

// Start the server

const init = async () => {
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
