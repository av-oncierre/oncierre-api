
var router = require('express').Router();
var passwordGenerator = require('secure-random-password');
var nodemailer = require('nodemailer');
var { google } = require("googleapis");
var OAuth2 = google.auth.OAuth2;
const base64 = require('base64url');

function generatePassword() {
    const password = passwordGenerator.randomPassword({length: 16, characters:[passwordGenerator.lower, passwordGenerator.upper,passwordGenerator.digits]});
    return password;
}

function generateRandomNumber() {
    const randomNumber = passwordGenerator.randomPassword({length: 6, characters:[passwordGenerator.digits]});
    return randomNumber;
}

function sendMailToUser(userMailId, emailTemplate){
    console.log('Mailing User Registration Details');
    const oauth2Client = new OAuth2(
        process.env.USER_CLIENT_ID, //Client Id
        process.env.USER_CLIENT_SECRET, //Client Secret
        process.env.USER_CLIENT_REDIRECT_URL // Redirect URL
    );

    oauth2Client.setCredentials({refresh_token: process.env.USER_REFRESH_TOKEN});

    const accessToken = oauth2Client.getAccessToken()
    const smtpTransport = nodemailer.createTransport({
        service: process.env.USER_MAIL_SERVICE,
        port: 465,
        secure: true,
        auth: {
            type: process.env.USER_MAIL_TYPE,
            user: process.env.USER_EMAIL_ID, 
            clientId: process.env.USER_CLIENT_ID,
            clientSecret: process.env.USER_CLIENT_SECRET,
            refreshToken: process.env.USER_REFRESH_TOKEN,
            accessToken: accessToken
        }
    });

    const mailOptions = {
        from: process.env.USER_EMAIL_ID,
        to: userMailId,
        subject: "Oncierre Registration Confirmation Email",
        generateTextFromHTML: true,
        html: emailTemplate
    }
    smtpTransport.sendMail(mailOptions, (error, response) => {
        error ? console.log(error) : console.log(response);
        smtpTransport.close();
    });
}


function sendForgotPasswordMail(userEmail, emailTemplate){
    const oauth2Client = new OAuth2(
        process.env.USER_CLIENT_ID, //Client Id
        process.env.USER_CLIENT_SECRET, //Client Secret
        process.env.USER_CLIENT_REDIRECT_URL // Redirect URL
    );

    oauth2Client.setCredentials({refresh_token: process.env.USER_REFRESH_TOKEN});

    const accessToken = oauth2Client.getAccessToken()
    const smtpTransport = nodemailer.createTransport({
        service: process.env.USER_MAIL_SERVICE,
        auth: {
            type: process.env.USER_MAIL_TYPE,
            user: process.env.USER_EMAIL_ID, 
            clientId: process.env.USER_CLIENT_ID,
            clientSecret: process.env.USER_CLIENT_SECRET,
            refreshToken: process.env.USER_REFRESH_TOKEN,
            accessToken: accessToken
        }
    });

    const mailOptions = {
        from: process.env.USER_EMAIL_ID,
        to: userEmail,
        subject: "Oncierre Password Reset Mail",
        generateTextFromHTML: true,
        //html: '<a href="http://localhost:8080/api/resetpassword/' + payload.username + '/' + userToken + '">Reset password</a>'
        //html: 'Your One Time Password Is ' + secureNumber
        html:emailTemplate
    }
    smtpTransport.sendMail(mailOptions, (error, response) => {
        error ? console.log(error) : console.log(response);
        smtpTransport.close();
    });
}

function validateToken(JWT_BASE64_URL_TOKEN){
    let JWT_BASE64_URL = JWT_BASE64_URL_TOKEN;
    // Returns an array of strings separated by the period
    let jwtParts = JWT_BASE64_URL.split('.');
    let payloadInBase64UrlFormat = jwtParts[1];
    let decodedPayload = base64.decode(payloadInBase64UrlFormat);
    let payloadObjString = JSON.parse(decodedPayload);
    return payloadObjString;
}
module.exports = {generatePassword, sendMailToUser, generateRandomNumber, sendForgotPasswordMail, validateToken};