const nodemailer = require('nodemailer');

const SENDER_EMAIL = process.env.EMAIL_USER; // E.g. majorproject785@gmail.com

// Create a Nodemailer transporter using SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationEmail = async (to, token) => {
    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    try {
        console.log(`Attempting to send verification email to: ${to}`);

        const mailOptions = {
            from: `"SocialSync" <${SENDER_EMAIL}>`,
            to: to,
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
                <p style="color: #999; font-size: 12px;">This link will expire in 1 hour.</p>
              </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('CRITICAL: Verification Email sending failed!');
        console.error('Error details:', error);
        return false;
    }
};

const sendPasswordResetEmail = async (to, token) => {
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    try {
        console.log(`Attempting to send password reset email to: ${to}`);

        const mailOptions = {
            from: `"SocialSync Support" <${SENDER_EMAIL}>`,
            to: to,
            subject: 'Reset your SocialSync Password',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2563eb;">Password Reset Request</h2>
                <p>We received a request to reset your password. Click the link below to choose a new one:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">This link will expire in 1 hour.</p>
              </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('CRITICAL: Password Reset Email sending failed!');
        console.error('Error details:', error);
        return false;
    }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
