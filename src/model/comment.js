const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog", // Referencing the Blog collection
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Referencing the User collection
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },

  commentOn: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
    default: new Date(),
  },
});

module.exports = mongoose.model("comment", commentSchema);
