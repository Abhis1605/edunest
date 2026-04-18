import mongoose, { Schema } from "mongoose";

const AssignmentSchema = new Schema({
    subjectName: {
        type: String,
        required: true,
        trim: true,
    },
    class: {
        type: String,
        required: true,
    },
    section: {
        type: String,
        required: true,
    }
})

const TeacherSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }, 
    assignments: [AssignmentSchema],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

export default mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema)