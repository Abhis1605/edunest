import mongoose, { Schema } from "mongoose";

const AttendanceSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    },
    subjectId: {
        type: Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    }, 
    teacherId: {
        type: Schema.Types.ObjectId,
        ref: "Teacher",
        required: true
    },
    date :{
        type: Date,
        required: 'true'
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
    }
}, { timestamps: true })

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema)