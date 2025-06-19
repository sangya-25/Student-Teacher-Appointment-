const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendEmail({ to, subject, html, replyTo }) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  };
  if (replyTo) {
    mailOptions.replyTo = replyTo;
  }
  return transporter.sendMail(mailOptions);
}

module.exports = sendEmail; 