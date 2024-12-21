const express = require("express");
const blog = require("../model/blog");
const { userAuth } = require("../middleware/auth");
const { default: mongoose } = require("mongoose");
const { status } = require("express/lib/response");
const {
  cloudinary,
  deleteImage,
  uploadBase64Image,
} = require("../utils/cloudinary");

const blogRouter = express.Router();

blogRouter.post("/add", userAuth, async (req, res) => {
  const { content, img } = req.body;
  const loggedInUser = req.user;

  try {
    // Validate input
    if (!content || !img) {
      return res.status(400).json({
        message: "Content and image are required.",
        status: false,
        statusCode: 400,
      });
    }

    // Upload Base64 image to Cloudinary
    const uploadImage = await uploadBase64Image(img, "blogImage");

    console.log(uploadImage);

    if (!uploadImage || !uploadImage.public_id || !uploadImage.format) {
      return res.status(500).json({
        message: "Failed to upload image to Cloudinary.",
        status: false,
        statusCode: 500,
      });
    }

    // Create blog entry
    const public_id = uploadImage.public_id;
    const format = uploadImage.format;
    const newBlog = new blog({
      author: loggedInUser._id,
      content,
      img: `${public_id}.${format}`,
    });

    const savedBlog = await newBlog.save();

    if (savedBlog) {
      return res.status(200).json({
        message: "Post added successfully!",
        status: true,
        statusCode: 200,
        data: savedBlog,
      });
    } else {
      return res.status(400).json({
        message: "Failed to add post to the database.",
        status: false,
        statusCode: 400,
      });
    }
  } catch (error) {
    console.error("Error while adding blog post:", error.message);

    return res.status(500).json({
      message: "Something went wrong while adding the post.",
      status: false,
      statusCode: 500,
      error: error.message,
    });
  }
});

//get self Blog
blogRouter.get("/blog/get", userAuth, async (req, res) => {
  const loggedInUser = req.user;
  try {
    const blogData = await blog.find({ author: loggedInUser._id });
    if (blogData) {
      res.status(200).json({
        message: "Data Found Sucessfully...!",
        statsu: true,
        statusCode: 200,
        data: blogData,
      });
    } else {
      res.status(400).json({
        message: "Something Went Wrong...!",
        status: false,
        statusCode: 400,
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something Went Wrong...!",
      status: false,
      statusCode: 500,
    });
  }
});

blogRouter.get("/blog/getAll", userAuth, async (req, res) => {
  const loggedInUser = req.user;
  try {
    const blogData = await blog.find();
    if (blogData) {
      res.status(200).json({
        message: "Data Found Sucessfully...!",
        statsu: true,
        statusCode: 200,
        data: blogData,
      });
    } else {
      res.status(400).json({
        message: "Something Went Wrong...!",
        status: false,
        statusCode: 400,
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something Went Wrong...!",
      status: false,
      statusCode: 500,
    });
  }
});

blogRouter.put("/blog/update/:id", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { img } = req.body;

    const id = req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Blog ID.",
        status: false,
        statusCode: 400,
      });
    }

    // Explicitly cast _id to ObjectId
    const blogData = await blog.findById(new mongoose.Types.ObjectId(id));

    if (!blogData) {
      return res.status(404).json({
        message: "Blog Is Not Found...!",
        status: false,
        statsuCode: 404,
      });
    }
    if (loggedInUser._id.toString() !== blogData.author.toString()) {
      return res.status(403).json({
        message: "You are not authorized to update this blog....!",
        status: false,
        statsuCode: 403,
      });
    }

    const oldImagePublicId = blogData.img.split(".")[0]; // Extract the public ID

    console.log(oldImagePublicId);

    await deleteImage(oldImagePublicId);

    // Upload Base64 image to Cloudinary
    const uploadImage = await uploadBase64Image(img, "blogImage");

    console.log(uploadImage);

    // Create blog entry
    const updateUrl = `${uploadImage.public_id}.${uploadImage.format}`;
    const updateBlog = await blog.findByIdAndUpdate(
      id,
      { $set: { ...req.body, img: updateUrl, updatedAt: new Date() } },
      { new: true, runValidators: true } // Ensure it returns the updated document and validates the input
    );

    if (updateBlog) {
      res.status(200).json({
        message: "Blog Updated Sucessfully...!",
        status: true,
        statusCode: 200,
        data: updateBlog,
      });
    } else {
      res.status(400).json({
        message: "Something Went Wrong...!",
        status: false,
        statusCode: 400,
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something Went Wrong...!",
      status: false,
      statusCode: 500,
    });
  }
});

blogRouter.delete("/blog/delete/:id", userAuth, async (req, res) => {
  const loggedInUser = req.user;
  const id = req.params.id;
  try {
    if (!id) {
      return res
        .status(400)
        .json({ message: "Invalid Blog Id", status: false, statusCode: 400 });
    }
    const blogData = await blog.findById(id);

    if (!blogData) {
      return res.status(404).json({
        message: "Blog is Not Found...!",
        status: false,
        statusCode: 404,
      });
    }

    if (loggedInUser._id.toString() !== blogData.author.toString()) {
      return res.status(403).json({
        message: " Opps...! ,You are not authorized to Delete this blog....!",
        status: false,
        statsuCode: 403,
      });
    }

    if (blogData.img) {
      const public_id = blogData.img.split(".")[0];
      await cloudinary.uploader.destroy(public_id);
    }

    const deleteBlog = await blog.findByIdAndDelete(id);
    if (deleteBlog) {
      res.status(200).json({
        message: "Blog Deleted Sucessfully...!",
        status: true,
        statsuCode: 200,
      });
    }

    console.log(blogData);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something Went Wrong...!",
      status: false,
      statusCode: 500,
    });
  }
});

blogRouter.post("/blog/like/:id", userAuth, async (req, res) => {
  try {
    const id = req.params.id;

    const loggedInUser = req.user;

    const blogData = await blog.findById(id);
    if (!blogData) {
      return res.status(404).json({
        message: "Blog Not Found...!",
        status: false,
        statsuCode: 400,
      });
    }

    if (!blogData.likes.includes(loggedInUser._id)) {
      await blog.updateOne(
        { _id: id },
        { $addToSet: { likes: loggedInUser._id } }
      );

      return res.status(200).json({
        message: "Blog Has been Liked..!",
        status: true,
        statsuCode: 200,
      });
    } else {
      await blog.updateOne({ _id: id }, { $pull: { likes: loggedInUser._id } });

      res.status(200).json({
        message: "Blog has been disliked...!",
        status: true,
        statsuCode: 200,
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something Went Wrong...!",
      status: false,
      statusCode: 500,
    });
  }
});
module.exports = blogRouter;
