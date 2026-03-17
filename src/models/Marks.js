import mongoose, { Schema } from "mongoose";

const MarksSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    teacherId: {
        type: Schema.Types.ObjectId,
        ref: "Teacher",
        required: true,
    },
    subjectName: {
        type: String,
        required: true,
    trim: true,
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

// prvent duplicate marks for same student same subject same exam
MarksSchema.index(
    { studentId: 1, subjectName: 1, examType: 1, class: 1, section: 1},
    { unique: true }
)

export default mongoose.models.Marks || mongoose.model('Marks', MarksSchema)