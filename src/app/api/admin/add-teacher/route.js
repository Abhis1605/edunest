import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Teacher from "@/models/Teacher";
import Subject from "@/models/Subject";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { generateCredentials } from "@/lib/generateCredentials";
import bcrypt from 'bcryptjs'
import Credentials from "next-auth/providers/credentials";

export async function POST(request) {
    try {
        await connectDB()

        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'admin') {
            return Response.json({
                message: "Unauthorized"
            }, { status: 401 })
        }

        const body = await request.json()
        const { name, phone, gender, subjectName, class:cls, section} = body
        
        const admin = await User.findById(session.user.id)
        console.log('Admin found:', admin)
        console.log('ShortForm', admin?.schoolShortform)
        const shortform = (admin.schoolShortForm || 'school')
        console.log('final shortform', shortform)

        const teacherCount = await User.countDocuments({
            role: "teacher"
        })
        const count = teacherCount + 1
        
        // generate credentials
        const { email, password } = generateCredentials(
            shortform, 'teacher', count
        )

        // Check if email already exists
        const existing = await User.findOne({ email })
        if (existing) {
            return Response.json({
                message: "Teacher already exists"
            }, { status: 400 })
        }

        // Hash password
        const hasedPassword = await bcrypt.hash(password, 10)

        // Create User
        const newUser = await User.create({
            name,
            email,
            password: hasedPassword,
            role: 'teacher',
            phone,
            gender,
            isActice: true,
            isProfileComplete: false
        })

        //create Teacher
        const newTeacher = await Teacher.create({
            userId: newUser._id,
            assignedClasses: [{ class: cls, section }],
            isActive: true
        })

        //create subject
        const newSubject = await Subject.create({
            name: subjectName,
            teacherId: newTeacher._id,
            class: cls,
            section,
            isActive: true,
        })

        await Teacher.findByIdAndUpdate(newTeacher._id, {
            subjects: [newSubject._id]
        })

        return Response.json({
            message: 'Teacher added successfully',
            Credentials: { email, password }
        })

    } catch (error) {
        return Response.json({
            message: 'Failed',
            error: error.message
        }, { status: 500 })
    }
}