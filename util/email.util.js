const nodemailer = require("nodemailer");
const config = require("config");

const sendEmail = async (options) => {
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.get("emailAddress"),
      pass: config.get("emailPassword"),
    },
  });
  const mailOptions = {
    from: config.get("emailAddress"),
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
