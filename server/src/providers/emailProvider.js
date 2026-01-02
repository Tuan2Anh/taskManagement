const sendEmail = async (email, subject, text) => {
    // In a real application, you would use nodemailer or a 3rd party service (SendGrid, AWS SES)
    console.log('--- EMAIL SENT ---');
    console.log(`To: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    console.log('------------------');
};

module.exports = { sendEmail };
