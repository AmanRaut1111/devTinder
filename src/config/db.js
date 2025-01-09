const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://aman:aman786@cluster0.csuba.mongodb.net/devTinder"
  );
};

module.exports = connectDB;
