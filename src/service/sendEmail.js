const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Ensure that necessary environment variables are provided
if (
  !process.env.EMAIL_USER ||
  !process.env.EMAIL_PASS ||
  !process.env.SUPPORT_EMAIL
) {
  throw new Error(
    "Missing required environment variables: EMAIL_USER, EMAIL_PASS, SUPPORT_EMAIL."
  );
}

const sendEmail = async (userEmail, userName) => {
  try {
    // Create transporter object using SMTP service
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_USER, // Email address
        pass: process.env.EMAIL_PASS, // App password if using Gmail
      },
    });

    // Email content options
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: userEmail, // Recipient address
      subject: "Login Notification", // Subject line
      text: `Hello ${userName},

We wanted to notify you that you have successfully logged into your account. If this wasn't you, we recommend updating your password immediately for security purposes.

Thank you for using our service!

Best regards,
Aman Raut 
(DevTinder Team)`,
      html: `<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Notification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f9;
      color: #333;
      margin: 0;
      padding: 20px;
    }
    .container {
      background-color: #fff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      margin: auto;
    }
    h1 {
      color: #2c3e50;
    }
    p {
      font-size: 16px;
      line-height: 1.6;
    }
    .footer {
      font-size: 12px;
      color: #7f8c8d;
      margin-top: 20px;
    }
    .btn {
      background-color: #3498db;
      color: #fff;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello ${userName},</h1>
    <p>We wanted to notify you that you have successfully logged into your account on our platform. If this wasn't you, we strongly recommend updating your password immediately to ensure your account remains secure.</p>
    <p>Thank you for using our service!</p>
    <a href="https://yourdomain.com/contact-support" class="btn">Contact Support</a>
    <div class="footer">
      <p>Best regards,</p>
      <p>Aman Raut <br>(DevTinder Team)</p>
      <p>For inquiries, email us at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a>.</p>
    </div>
  </div>
</body>
</html>`,
    };

    // Send email and log response
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);

    return {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    };
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

module.exports = sendEmail;
