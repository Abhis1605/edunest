import { Section } from "lucide-react";
import mongoose, { mongo, Schema } from "mongoose";

const TeacherSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }, 
    subjects: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Subject',
        }
    ],
    assignedClasses: [
        {
            class: {
                type: String,
                trim: true,
            }, 
            section: {
                type: String,
                trim: true
            },
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

export default mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema)