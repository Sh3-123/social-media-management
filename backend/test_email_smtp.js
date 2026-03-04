require('dotenv').config({ path: '../.env.vercel' });
const nodemailer = require('nodemailer');

async function test() {
    console.log("Testing SMTP connection...");
    console.log("User:", process.env.EMAIL_USER);
    
    // Create a Nodemailer transporter using SMTP
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        await transporter.verify();
        console.log("Server is ready to take our messages");
    } catch (error) {
        console.error("Error connecting to SMTP:", error);
    }
}
test();
