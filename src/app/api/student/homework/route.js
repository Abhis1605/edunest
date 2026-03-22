import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Homework from "@/models/Homework";
import Student from "@/models/Student";
import { getServerSession } from "next-auth";


export async function GET() {
    try {
        await connectDB()

        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'student') {
            return Response.json({
                message: 'Unauthorized'
            }, { status: 401 })
        }

        const student = await Student.findOne({
            userId: session.user.id,
            isActive: true
        })
        if (!student) {
            return Response.json({
                message: 'Student not found'
            }, { status: 404 })
        }

        const homework = await Homework.find({
            class: student.class,
            section: student.section,
            isActive: true,
        }).sort({ dueDate: 1 })

        const now = new Date()
        const active = homework.filter(h => new Date(h.dueDate) >= now)
        const past = homework.filter(h => new Date(h.dueDate) < now)

        return Response.json({
            active, 
            past
        })
    } catch (error) {
        return Response.json({
            message: 'Failed',
            error: error.message
        }, { status: 500 })
    }
}