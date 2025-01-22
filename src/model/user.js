const mongoose = require("mongoose");
const validator = require("validator");
const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      minlength: 4,
    },
    lastName: {
      type: String,
    },

    emailId: {
      type: String,
      lowercase: true,
      required: true,
      index: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email");
        }
      },
    },
    password: {
      type: String,
    },
    gender: {
      type: String,
      validate: function (value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Gender data is not valid");
        }
      },
    },
    age: {
      type: Number,
    },
    photoUrl: {
      type: String,
    },
    about: {
      type: String,
      default: "I am a NodeJs Developer",
    },
    skills: {
      type: [String],
    },
    ispremium: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);
module.exports = User;
