const nodemailer = require("nodemailer");
const config = require("config");

const sendEmail = async (options) => {
  const transport = nodemailer.createTransport({
    host: config("host"),
    port: config("port"),
    auth: {
      user: config("username"),
      pass: config("password"),
    },
  });
  const mailOptions = {
    from: config.get("wallet@mail.com"),
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
