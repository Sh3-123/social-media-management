const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Standard setup, user will need to put actual credentials
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendVerificationEmail = async (to, token) => {
    const verifyLink = `${process.env.CLIENT_URL}/verify/${token}`;

    const mailOptions = {
        from: `"SocialSync" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Verify your SocialSync email',
        html: `
      <h2>Welcome to SocialSync!</h2>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verifyLink}" style="padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">
        Verify Email
      </a>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>This link will expire in 24 hours.</p>
    `,
    };

    try {
        // Only send if email user isn't default placeholder
        if (process.env.EMAIL_USER !== 'your_email@gmail.com') {
            await transporter.sendMail(mailOptions);
        } else {
            console.log('Dummy email notification sent:', verifyLink);
        }
    } catch (error) {
        console.error('Email sending failed:', error);
    }
};

module.exports = { sendVerificationEmail };
