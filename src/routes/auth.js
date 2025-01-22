const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const User = require("../model/user");
const { validsignupData } = require("../utils/validation");
const { status } = require("express/lib/response");
const authRouter = express.Router();
const nodemailer = require("nodemailer");
const { sendLoginEmail, sendWelcomeEmail } = require("../service/sendEmail");
const sendWhatsAppMessage = require("../service/sendWhatsappMessage");
dotenv.config();

authRouter.post("/signup", async (req, res) => {
  const { firstName, lastName, emailId, password } = req.body;

  try {
    // Validate signup data
    validsignupData(req);

    // Check if the user already exists
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already in use. Please use a different email.",
        status: false,
        statusCode: 400,
      });
    }

    // Hash the user's password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashPassword,
    });

    // Save the user to the database
    const saveUser = await user.save();

    // Generate a JWT token
    const token = jwt.sign({ _id: saveUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRESIN,
    });

    // Set the JWT token as a cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 45 * 60 * 1000, // 45 minutes
    });

    // Send a response before sending the email
    res.status(201).json({
      message: "User signed up successfully.",
      status: true,
      statusCode: 201,
      data: {
        id: saveUser._id,
        firstName: saveUser.firstName,
        lastName: saveUser.lastName,
        emailId: saveUser.emailId,
      },
    });

    // Send the welcome email asynchronously
    try {
      await sendWelcomeEmail(saveUser.emailId, saveUser.firstName);
      sendWhatsAppMessage(saveUser.firstName, saveUser.lastName);
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError.message);
    }
  } catch (error) {
    console.error("Signup error:", error.message);
    return res.status(400).json({
      message: "Signup failed.",
      status: false,
      statusCode: 400,
      error: error.message,
    });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
        status: false,
        statusCode: 400,
      });
    }

    // Verify password
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({
        message: "Invalid Credentials",
        status: false,
        statusCode: 400,
      });
    }

    // Generate token
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || "devTinder",
      { expiresIn: "1d" }
    );

    // Set cookie
    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true, // Make the cookie inaccessible from JavaScript
      secure: process.env.NODE_ENV === "production", // Ensure cookie is sent over HTTPS
      sameSite: "Strict", // Helps prevent CSRF
    });

    // Send success response
    res.status(200).json({
      message: `${user.firstName} Login Successfully!`,
      status: true,
      statusCode: 200,
      data: {
        id: user._id,
        firstName: user.firstName,
        emailId: user.emailId,
      },
    });

    // Optionally send login email (uncomment and configure as needed)
    // sendLoginEmail(user.emailId, user.firstName)
    //   .then(() => console.log("Email sent successfully"))
    //   .catch((error) => console.error("Error sending email:", error.message));
  } catch (error) {
    console.error("Error in login route:", error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Something went wrong",
        status: false,
        statusCode: 500,
        error: error.message,
      });
    }
  }
});

authRouter.post("/logout", (req, res) => {
  try {
    // Clear the token cookie from the client's browser
    res.clearCookie("token", {
      path: "/", // Ensures that the cookie is cleared from the root path
      httpOnly: true, // Ensures that the cookie is not accessible through JavaScript
      secure: process.env.NODE_ENV === "production", // Set to true in production (HTTPS)
      sameSite: "Strict", // Ensures the cookie is sent only in a first-party context
    });

    // Send success response
    res.status(200).json({
      message: "Logout successfully!",
      status: true,
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred during logout.");
  }
});

module.exports = authRouter;
