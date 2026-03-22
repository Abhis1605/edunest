import mongoose, { Schema } from "mongoose";

const AttendanceSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    },
    teacherId: {
        type: Schema.Types.ObjectId,
        ref: "Teacher",
        required: true
    },
    date :{
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent'],
        required: true
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
    }
}, { timestamps: true })

// This prevent duplicate attendence for same student on same day
AttendanceSchema.index(
    { studentId: 1, date: 1 },
    { unique: true }
)

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema)