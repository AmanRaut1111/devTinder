const jwt = require("jsonwebtoken");
const User = require("../model/user");

const userAuth = async (req, res, next) => {
  try {
    const cookieData = req.cookies;

    // Check if token exists in cookies
    if (!cookieData || !cookieData.token) {
      return res.status(401).json({
        message: "Unauthorized: Please log in",
        status: false,
      });
    }

    // Verify the token
    const decoded = jwt.verify(cookieData.token, process.env.JWT_SECRET);

    // Find the user in the database
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized: User not found",
        status: false,
      });
    }

    // Attach user to the request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in userAuth middleware:", error);
    return res.status(401).json({
      message: "Authentication Failed: " + error.message,
      status: false,
    });
  }
};

module.exports = { userAuth };
