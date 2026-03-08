import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Teacher from "@/models/Teacher";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { generateCredentials } from "@/lib/generateCredentials";
import bcrypt from 'bcryptjs'

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
        const { name, phone, gender, assignments } = body

        if (!assignments || assignments.length === 0 ){
            return Response.json({
                message: "At least one assignment is required"
            }, { status: 400 })
        }
        
        const admin = await User.findById(session.user.id)
        // console.log('Admin found:', admin)
        // console.log('ShortForm', admin?.schoolShortform)
        const shortform = (admin.schoolShortForm || 'school').toLowerCase()
        // console.log('final shortform', shortform)

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
            isActive: true,
            isProfileComplete: false
        })

        await Teacher.create({
            userId: newUser._id,
            assignments: assignments,
            isActive: true
        })

        return Response.json({
            message: 'Teacher added successfully',
            credentials: { email, password }
        })

    } catch (error) {
        return Response.json({
            message: 'Failed',
            error: error.message
        }, { status: 500 })
    }
}