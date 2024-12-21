const jwt = require("jsonwebtoken");
const User = require("../model/user");
const { status } = require("express/lib/response");
const userAuth = async (req, res, next) => {
  try {
    const cookieData = req.cookies;

    if (!cookieData.token) {
      return res
        .status(401)
        .json({
          message: "UnAuthorized Please LogIn",
          status: false,
          statusCode: 401,
        });
    }
    const decoded = jwt.verify(cookieData.token, "devTinder");
    const user = await User.findById(decoded._id);
    if (!user) {
      throw new Error("unAuthorized");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(404).send("something went wrong " + error.message);
    console.log(error);
  }
};

module.exports = { userAuth };
