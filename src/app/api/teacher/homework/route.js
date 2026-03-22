import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Teacher from "@/models/Teacher";
import Homework from "@/models/Homework";


export async function GET() {
    try {
        await connectDB()

        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'teacher') {
            return Response.json({
                message: "Unauthorized"
            }, { status: 401 })
        }

        const teacher = await Teacher.findOne({
            userId: session.user.id, isActive: true
        })
        if (!teacher) {
            return Response.json({
                message: "Teacher not found"
            }, { status: 404 })
        }
        const homework = await Homework.find({
            teacherId: teacher._id,
            isActive: true
        }).sort({ createdAt: -1 })

        return Response.json({
            homework
        })
    } catch (error) {
        return Response.json({
            message: 'Failed', error: error.message
        }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        await connectDB()

        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'teacher') {
            return Response.json({
                message: 'Unauthorized'
            }, { status: 401 })
        }

        const teacher = await Teacher.findOne({
            userId: session.user.id, isActive: true
        })
        if (!teacher) {
            return Response.json({
                message: 'Teacher not found'
            }, { status: 404 })
        }

        const body = await request.json()
        const { title, description, subjectName, cls, section, dueDate } = body

        if (!title || !subjectName || !cls || !section || !dueDate ) {
            return Response.json({
                message: 'Please fill all required fields'
            }, { status: 400 })
        }

        const isAssigned = teacher.assignments.some(
            a => a.class === cls && 
            a.section === section && 
            a.subjectName === subjectName
        )
        if (!isAssigned) {
            return Response.json({
                message: "You are not assigned to this class/subject"
            }, { status: 403 })
        }

        await Homework.create({
            teacherId: teacher._id,
            title,
            description,
            subjectName,
            class: cls,
            section,
            dueDate: new Date(dueDate),
            isActive: true,
        })

        return Response.json({
            message: 'Homework assigned successfully'
        })
    } catch (error) {
        return Response.json({
            message: 'Failed', error: error.message
        }, { status: 500 })
    }
}

export async function DELETE(request){
    try {
        await connectDB()

        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'teacher') {
            return Response.json({
                message: 'Unauthorized'
            }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        await Homework.findByIdAndUpdate(id, { isActive: false })

        return Response.json({
            message: 'Homework deleted successfully'
        })
    } catch (error) {
        return Response.json({
            message: 'Failed', error: error.message
        }, { status: 500 })
    }
}