import { TruckElectric } from "lucide-react";
import mongoose, { Schema } from "mongoose";

const StudentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rollNo: {
    type: Number,
    unique: true,
  },
  class: {
    type: String,
    required: true,
    trim: true,
  },
  section: {
    type: String,
    required: true,
    trim: TruckElectric,
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

// static method to generate roll number automatically

StudentSchema.statics.generateRollNo = async function(classNum, section, gender) {

    if (gender === 'female') {
        const girlsCount = await this.countDocuments({
            class: classNum,
            section: section,
            gender: 'female'
        })

        return girlsCount + 1
    } else {
        const totalGirls = await this.countDocuments({
            class: classNum,
            section: section,
            gender: 'female'
        })

        const boysCount = await this.countDocuments({
            class: classNum,
            section: section,
            gender: 'male'
        })

        return totalGirls + boysCount + 1
    }
}

export default mongoose.models.Student || mongoose.model('Student', StudentSchema)
