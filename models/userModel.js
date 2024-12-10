import mongoose from "mongoose";

// Define the User Schema
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, 
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"], 
    },
    password: {
      type: String,
      required: true,
    //   minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profilePic: {
      type: String, 
      default: "",
    },
  },
  {
    timestamps: true, 
  }
);

// Create and export the User model
const userModel = mongoose.model("User", userSchema);
export default userModel;
