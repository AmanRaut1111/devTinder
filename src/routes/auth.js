const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const User = require("../model/user");
const { validsignupData } = require("../utils/validation");
const { status } = require("express/lib/response");
const authRouter = express.Router();
const nodemailer = require("nodemailer");
const sendEmail = require("../service/sendEmail");
dotenv.config();

authRouter.post("/signup", async (req, res) => {
  const { firstName, lastName, emailId, password } = req.body;
  try {
    validsignupData(req);
    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashPassword,
    });
    const saveUser = await user.save();
    const token = jwt.sign({ _id: saveUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRESIN,
    });

    res.cookie("token", token, { maxAge: 45 * 60 * 1000 });
    res.status(200).json({
      message: "User Signup Sucessfully",
      status: true,
      statusCode: 200,
      data: saveUser,
    });
  } catch (error) {
    res.send("something went Wrong" + error.message);
    console.log(error);
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
      {
        expiresIn: "1d",
      }
    );

    // Set cookie
    res.cookie("token", token, {
      maxAge: 45 * 60 * 1000, // 45 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure cookie in production
    });

    // Send response immediately
    res.status(200).json({
      message: `${user.firstName} Login Successfully!`,
      status: true,
      statusCode: 200,
      data: { id: user._id, firstName: user.firstName, emailId: user.emailId },
    });

    // Asynchronously send login email
    sendEmail(user.emailId, user.firstName)
      .then(() => console.log("Email sent successfully"))
      .catch((error) => console.error("Error sending email:", error.message));
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
    res.clearCookie("token"); // Clears the token cookie
    res.status(200).json({
      message: "Logout Sucessfully...!",
      status: true,
      statusCode: 200,
    });
  } catch (error) {
    res.status(500).send("An error occurred during logout.");
  }
});

module.exports = authRouter;
