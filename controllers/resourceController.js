import resourceModel from "../models/resourceModel.js";
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadResource = async (req, res) => {
  try {
    const { title, semester, subject, resourceLink } = req.body;
    const userId = req.user._id;
    let url = "";

    if (req.file) {
      const fileName = `${uuidv4()}_${title.replace(/\s+/g, '_')}.pdf`;
      const result = await cloudinary.uploader.upload(req.file.path,
        {
          resource_type: "auto",
          public_id: `resources/${fileName}`,
        },
        (error, result) => {
          if (error) {
            throw new Error(error.message);
          }
          return result;
        },
      );
      url = result.url;
    } else {
      url = resourceLink;
    }

    // Store in Database
    const newResource = new resourceModel({
      title,
      semester,
      subject,
      userId,
      resourceLink: url,
    });
    await newResource.save();


    res.status(201).json({
      success: true,
      message: "Resource uploaded successfully",
      newResource
    });

  } catch (error) {
    console.error("Error uploading resource:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading resource",
      error: error.message,
    });
  }
};


export const updateResource = async (req, res) => {
  try {
    const { id } = req.params; // ID of the resource to update
    const { title, semester, subject, resourceLink } = req.body;
    let updatedUrl = "";

    // Fetch the existing resource
    const resource = await resourceModel.findById(id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    if (resource.resourceLink && resource.resourceLink.includes("cloudinary.com")) {
      const publicId = resource.resourceLink.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`resources/${publicId}`, { resource_type: "raw" });
    }

    if (req.file) {
      const fileName = `${uuidv4()}_${title.replace(/\s+/g, '_')}.pdf`;
      const result = await cloudinary.uploader.upload(req.file.path,
        {
          resource_type: "auto",
          public_id: `resources/${fileName}`,
        },
        (error, result) => {
          if (error) {
            throw new Error(error.message);
          }
          return result;
        },
      );
      updatedUrl = result.url;
    } else if (resourceLink) {
      // Use the provided URL
      updatedUrl = resourceLink;
    } else {
      // No valid input for resourceLink
      return res.status(400).json({
        success: false,
        message: "Either a file or a valid resource link must be provided",
      });
    }

    // Update the resource in the database
    resource.title = title || resource.title;
    resource.semester = semester || resource.semester;
    resource.subject = subject || resource.subject;
    resource.resourceLink = updatedUrl;
    await resource.save();

    res.status(200).json({
      success: true,
      message: "Resource updated successfully",
      resource,
    });
  } catch (error) {
    console.error("Error updating resource:", error);
    res.status(500).json({
      success: false,
      message: "Error updating resource",
      error: error.message,
    });
  }
};


export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params; // ID of the resource to delete

    // Fetch the resource to check if it exists
    const resource = await resourceModel.findById(id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    // Delete the resource file from Cloudinary if it exists
    if (resource.resourceLink && resource.resourceLink.includes("cloudinary.com")) {
      const publicId = resource.resourceLink.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`resources/${publicId}`, { resource_type: "raw" });
    }

    // Delete the resource from the database
    await resourceModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting resource:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting resource",
      error: error.message,
    });
  }
};

