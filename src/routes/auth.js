const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../model/user");
const { validsignupData } = require("../utils/validation");
const { status } = require("express/lib/response");
const authRouter = express.Router();

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
    const token = jwt.sign({ _id: saveUser._id }, "devTinder", {
      expiresIn: "1d",
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
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid Credials", status: true, statusCode: 200 });
    }
    const checkPassword = await bcrypt.compare(password, user.password);
    if (checkPassword) {
      const token = jwt.sign({ _id: user._id }, "devTinder", {
        expiresIn: "1d",
      });

      res.cookie("token", token, { maxAge: 45 * 60 * 1000 });
      res.status(200).json({
        message: `${user.firstName} Login Sucessfully...!`,
        status: true,
        statusCode: 200,
        data: user,
      });
    } else {
      return res.status(400).json({
        message: "Invalid Credials",
        status: true,
        statusCode: 200,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("Something ent wrong" + error.message);
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
