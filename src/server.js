const Hapi = require('hapi');
const nodemailer = require('nodemailer');
const card = require('./card.js');
const { exec } = require('child_process');

const PRINT_TYPES = {
    FULL_CARD: Symbol('fullcard'),
    JUST_ANNOTATION: Symbol('just-annotation')
};

const PRINT_TYPE = PRINT_TYPES.JUST_ANNOTATION;
const DO_PRINT = false;

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
    host: 'localhost',
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
    console.log("Player score received:", request.payload);

    const cardFiles = await card.annotate({
        name: request.payload.Firstname || "NONAME",
        score: request.payload.score || "NOSCORE",
        accountID: request.payload.AccountId || "NOID"
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
