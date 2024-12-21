const express = require("express");
const { userAuth } = require("../middleware/auth");
const { validateEditProfileData } = require("../utils/validation");
const { status } = require("express/lib/response");

const profileRouter = express.Router();
profileRouter.get("/profile", userAuth, async (req, res) => {
  const cookieData = req.cookies;
  try {
    const user = req.user;

    res.send(user);
  } catch (error) {
    console.log(error);
    res.send("Something Went Wrong " + error.message);
  }
});
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error(" Invalid Edit");
    }
    const loggedInUser = req.user;
    console.log(loggedInUser);

    Object.keys(req.body).forEach((key) => {
      if (key === "skills" && Array.isArray(req.body[key])) {
        // Remove duplicates from the skills array
        loggedInUser[key] = [...new Set(req.body[key])];
      } else {
        loggedInUser[key] = req.body[key];
      }
    });
    await loggedInUser.save();

    res.send("User Profile Updated sucessfully..!!!");
  } catch (error) {
    res
      .status(400)
      .json({ message: "Something Went Wrong", status: false, statCode: 400 });
    console.log(error);
  }
});

profileRouter.patch("/profile/updatePassword", userAuth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      message: "Please Provide Input  Creandials",
      status: false,
      statsuCode: 400,
    });
  }
  const userData = req.user;
  console.log(userData);

  try {
    const checkPassword = await bcrypt.compare(oldPassword, userData.password);
    if (!checkPassword) {
      return res.status(400).json({
        message: "Old password does not match",
        status: false,
        statusCode: 400,
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne(
      { _id: userData._id },
      { password: hashedNewPassword }
    );
    res.status(200).json({
      message: "Password changed successfully",
      status: true,
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
      statusCode: 500,
    });
  }
});
module.exports = profileRouter;
