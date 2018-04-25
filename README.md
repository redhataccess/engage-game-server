# engage-game-server
Server for the summit 2017 Engage Game

## Setup

    npm install
    dnf install GraphicsMagick ImageMagick

## Run

    SMTP_PASS=<secret> npm start

Starts the server.  Replace <secret> with your smtp password.

NOTE: Must be used with nodemailer <= 2.7.2 as later versions require nodejs > version 4
