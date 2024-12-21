const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Add these values to your .env file
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadBase64Image(img, folder = "defaultFolder") {
  try {
    // Check if the image is in base64 format
    const base64Image = img.startsWith("data:")
      ? img
      : `data:image/jpeg;base64,${img}`;

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder,
    });

    return uploadResponse;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw new Error("Failed to upload image to Cloudinary.");
  }
}

const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log("Image deleted successfully:", publicId);
  } catch (error) {
    console.error("Failed to delete image:", error.message);
    throw new Error("Failed to delete the old image.");
  }
};
module.exports = { cloudinary, deleteImage, uploadBase64Image };
