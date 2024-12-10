import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  semester: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  resourceLink: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    trim: true,
    default: ""
  },
}, { timestamps: true });

const resourceModel = mongoose.model("Resource", resourceSchema);

export default resourceModel;
