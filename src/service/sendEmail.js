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
const sendLoginEmail = async (userEmail, userName) => {
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
      from: `"DevTinder Team" <${process.env.EMAIL_USER}>`, // Sender address
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
      font-family: 'Arial', sans-serif;
      background-color: #f9f9fb;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background-color: #f39c12;
      color: #fff;
      text-align: center;
      padding: 20px 10px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .body {
      padding: 20px 30px;
      text-align: left;
    }
    .body p {
      font-size: 16px;
      line-height: 1.6;
    }
    .cta-button {
      display: inline-block;
      background-color: #e74c3c;
      color: #ffffff;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      font-size: 16px;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      background-color: #ecf0f1;
      padding: 15px 10px;
      font-size: 14px;
      color: #7f8c8d;
    }
    .footer a {
      color: #3498db;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Login Alert, ${userName}!</h1>
    </div>
    <div class="body">
      <p>Hello ${userName},</p>
      <p>We wanted to let you know that you successfully logged into your account. If you recognize this activity, no further action is needed.</p>
      <p>If this wasn't you, please <strong>update your password immediately</strong> to secure your account.</p>
      <a href="https://devtinder.com/reset-password" class="cta-button">Reset Password</a>
    </div>
    <div class="footer">
      <p>If you have any concerns, feel free to contact us at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a>.</p>
      <p>Best regards,<br>Aman Raut<br>(DevTinder Team)</p>
    </div>
  </div>
</body>
</html>`,
    };

    // Send email and log response
    const info = await transporter.sendMail(mailOptions);

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

const sendWelcomeEmail = async (userEmail, userName) => {
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
      from: `"DevTinder Team" <${process.env.EMAIL_USER}>`, // Sender address
      to: userEmail, // Recipient address
      subject: "Welcome to DevTinder!", // Subject line
      text: `Hello ${userName},

Welcome to DevTinder! We’re so excited to have you join our growing community. Start your journey today by exploring all the amazing features we’ve crafted for you.

If you have questions, feel free to contact us at ${process.env.SUPPORT_EMAIL}.

Cheers,
Aman Raut 
(DevTinder Team)`,
      html: `<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to DevTinder</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f9f9fb;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background-color: #1abc9c;
      color: #fff;
      text-align: center;
      padding: 20px 10px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .body {
      padding: 20px 30px;
      text-align: left;
    }
    .body p {
      font-size: 16px;
      line-height: 1.6;
    }
    .cta-button {
      display: inline-block;
      background-color: #3498db;
      color: #ffffff;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      font-size: 16px;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      background-color: #ecf0f1;
      padding: 15px 10px;
      font-size: 14px;
      color: #7f8c8d;
    }
    .footer a {
      color: #3498db;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Welcome to DevTinder, ${userName}!</h1>
    </div>
    <div class="body">
      <p>We are so excited to have you as part of our community! At DevTinder, our mission is to connect developers like you with endless opportunities for growth, learning, and collaboration.</p>
      <p>Here’s what you can do next:</p>
      <ul>
        <li>Explore new connections with fellow developers.</li>
        <li>Join discussions and share your expertise.</li>
        <li>Enhance your skills with our curated resources.</li>
      </ul>
      <p>If you have any questions or need help getting started, we’re here for you.</p>
      <a href="" class="cta-button">Get Started Now</a>
    </div>
    <div class="footer">
      <p>Have questions? Reach out to us at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a>.</p>
      <p>Best regards,<br>Aman Raut and the DevTinder Team</p>
    </div>
  </div>
</body>
</html>`,
    };

    // Send email and log response
    const info = await transporter.sendMail(mailOptions);

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

module.exports = { sendLoginEmail, sendWelcomeEmail };
