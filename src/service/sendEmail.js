const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const sendEmail = async (userEmail, userName) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: userEmail, // Recipient address
      subject: "Login Notification", // Subject line
      text: `Hello ${userName},

We wanted to notify you that you have successfully logged into your account. If this wasn't you, we recommend updating your password immediately for security purposes.

If you need any assistance or have questions, feel free to contact our support team.

Thank you for using our service!

Best regards,
Aman Raut 
(DevTinder Team)
[Your Contact Information]`, // Plain text body

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
    <p>If you need any assistance or have questions, please don't hesitate to reach out to our support team. We're here to help!</p>
    <p>Thank you for using our service!</p>
    <a href="amanraut1111" class="btn">Contact Support</a>
    <div class="footer">
      <p>Best regards,</p>
      <p>Aman Raut <br>
(DevTinder Team)</strong></p>
      <p>For inquiries, email us at <a href="mailto:support@yourcompany.com">amanraut1111@gmail.com</a>.</p>
    </div>
  </div>
</body>
</html>`, // HTML body
    };

    const info = await transporter.sendMail(mailOptions);

    return info;
  } catch (error) {
    console.error("Email error:", error);
    throw new Error(error);
  }
};

module.exports = sendEmail;
