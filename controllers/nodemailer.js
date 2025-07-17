// nodemailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail", // Use your email service (e.g., Gmail, Outlook)
    auth: {
        user: 'adityabadaria1234@gmail.com', // Your email
        pass: 'dybk opck fwxu ccgg', // Your email password or app-specific password
    },
});

const sendEmail = (to, subject, text) => {
    const mailOptions = {
        from: 'adityabadaria1234@gmail.com',
        to,
        subject,
        text,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log("Email sent:", info.response);
        }
    });
};

module.exports = { sendEmail };