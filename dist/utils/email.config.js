"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodemailer = require('nodemailer');
const userEmail = process.env.USEREMAIL;
const emailPass = process.env.PASS;
const service = process.env.SERVICE;
const configOptions = {
    host: 'smtp.gmail.com',
    service: service,
    port: 587,
    secure: false,
    auth: {
        user: userEmail,
        pass: emailPass
    },
    tls: {
        rejectUnauthorized: false
    }
};
const sendMail = async (email, subject, html) => {
    try {
        const transport = nodemailer.createTransport(configOptions);
        await transport.sendMail({
            from: userEmail,
            to: email,
            subject: subject,
            html: html
        });
    }
    catch (error) {
        console.log('Email not sent');
        console.log(error);
    }
};
exports.default = sendMail;
