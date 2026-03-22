import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Teacher from "@/models/Teacher";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PUT(request){
    try {
        await connectDB()

        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'admin' ) {
            return Response.json({
                message: "Unauthorized"
            }, { status: 401 })
        }

        const { searchParams} = new URL(request.url)
        const id = searchParams.get('id')

        const body = await request.json()
        const { name, phone, gender, assignments } = body

        // Find teacher
        const teacher = await Teacher.findById(id)
        if (!teacher) {
            return Response.json({
                message: 'Teacher not found'
            }, { status:  404 })
        }

        // Update User
        await User.findByIdAndUpdate(teacher.userId, {
            name,
            phone,
            gender,
        })

        // Update Teacher assignments
        await Teacher.findByIdAndUpdate(id, {
            assignments
        })

        return Response.json({
            message: 'Teacher updated successfully'
        })
    } catch (error) {
        return Response.json({
            message: 'Failed',
            error: error.message
        }, { status: 500 })
    }
}