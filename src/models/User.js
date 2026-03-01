import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin', 'parent'],
        required: true,
    },
    phone: {
        type: String,
        trim: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        trim: true,
    },
    avatar: {
        type: String,
        enum: ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5', 'avatar6'],
        default: 'avatar1'
    }, 
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

export default mongoose.models.User || mongoose.model('User', UserSchema);