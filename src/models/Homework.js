import mongoose, { Schema } from "mongoose";

const HomeworkSchema = new Schema({
    teacherId: {
        type: Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true,
    },
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
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export default mongoose.models.Homework || 
mongoose.model('Homework', HomeworkSchema);