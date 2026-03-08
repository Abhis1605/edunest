import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Teacher from "@/models/Teacher";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function DELETE(request) {
    try {
        await connectDB()

        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'admin') {
            return Response.json({
                message: "Unauthorized"
            }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        // Find teacher
        const teacher = await Teacher.findById(id)
        if (!teacher) {
            return Response.json({
                message: "Teacher not found"
            }, { status: 404 })
        }

        // Deactivate teacher
        await Teacher.findByIdAndUpdate(id, {
            isActive: false
        })

        return Response.json({
            message: "Techer deleted successfully"
        })

    } catch (error) {
        return Response.json({
            message: "Failed",
            error: error.message
        }, { status: 500 })
    }
}