import mongoose, { Schema } from "mongoose";

const RemarksSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  subjectName: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  isAiGenerated: {
    type: Boolean,
    default: false,
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
}, { timestamps: true });

export default mongoose.models.Remarks || 
mongoose.model('Remarks', RemarksSchema);
