import mongoose, { Schema } from "mongoose";

const MarksSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    subjectId: {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
        required: true,
    },
    teacherId: {
        type: Schema.Types.ObjectId,
        ref: "Teacher",
        required: true,
    },
    examType: {
        type: String,
        enum: ['unit1', 'unit2', 'midterm', 'final'],
        required: true,
    },
    marks: {
        type: Number,
        required: true,
    },
    maxMarks: {
        type: Number,
        required: true,
        default: 100,
    },
    class: {
        type: String,
        required: true,
        trim: true
    },
    section: {
        type: String,
        required: true,
        trim: true,
    }
}, { timestamps: true })

export default mongoose.models.Marks || mongoose.model('Marks', MarksSchema)