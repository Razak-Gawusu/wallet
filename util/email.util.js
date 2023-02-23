const nodemailer = require("nodemailer");
const config = require("config");

const sendEmail = async (options) => {
  const transport = nodemailer.createTransport({
    host: config.get("host"),
    port: config.get("port"),
    auth: {
      user: config.get("username"),
      pass: config.get("password"),
    },
  });
  const mailOptions = {
    from: config.get("address"),
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
