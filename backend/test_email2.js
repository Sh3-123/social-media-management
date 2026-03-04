require('dotenv').config({ path: '../.env.vercel' });
const { sendVerificationEmail } = require('./src/utils/email');

async function test() {
    console.log("Testing with EMAIL_USER:", process.env.EMAIL_USER);
    console.log("Testing with CLIENT_URL:", process.env.CLIENT_URL);
    const success = await sendVerificationEmail('test@example.com', 'test-token-123');
    console.log("Email test success:", success);
}
test();
