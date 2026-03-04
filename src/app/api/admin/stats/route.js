import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
    try {
        await connectDB()

        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'admin') {
            return Response.json({
                message: 'Unauthorized'
            }, { status: 401 } )
        }

        const totalTeachers = await User.countDocuments({
            role: 'teacher',
            isActive: true
        })
        const totalStudents = await User.countDocuments({
            role: 'student',
            isActive: true
        })
        const totalParents = await User.countDocuments({
            role: "parent",
            isActive: true
        })

        return Response.json({
            totalTeachers,
            totalStudents,
            totalParents
        })
        
    } catch (error) {
        return Response.json({
            message: "Failed",
            error: error.message
        }, { status: 500 } )
    }
}