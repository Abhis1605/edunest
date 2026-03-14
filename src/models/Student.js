import mongoose, { Schema } from "mongoose";

const StudentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  class: {
    type: String,
    required: true,
    trim: true,
  },
  section: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  admissionYear: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true
  },
}, { timestamps: true });

export default mongoose.models.Student || mongoose.model('Student', StudentSchema)