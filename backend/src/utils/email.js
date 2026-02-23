const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
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
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563eb;">Welcome to SocialSync!</h2>
        <p>Please click the link below to verify your email address and activate your account:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyLink}" style="padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Verify Email Address
            </a>
        </div>
        <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">This link will expire in 24 hours.</p>
      </div>
    `,
    };

    try {
        console.log(`Attempting to send verification email to: ${to}`);
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('CRITICAL: Email sending failed!');
        console.error('Error details:', error.message);
        console.error('SMTP Status:', error.responseCode || 'N/A');
        return false;
    }
};

module.exports = { sendVerificationEmail };
