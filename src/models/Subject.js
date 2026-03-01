import mongoose, { Schema } from "mongoose";

const SubjectSchema = new Schema({
    name: {
        type: String, 
        required: true,
        trim: true,
    },
    teacherId: {
        type: Schema.Types.ObjectId,
        ref: "Teacher",
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
        trim: true
    }, isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true })

export default mongoose.models.Subject || mongoose.model("Subject", SubjectSchema)