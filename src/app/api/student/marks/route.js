import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Student from "@/models/Student";
import Marks from "@/models/Marks";


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

        const marks = await Marks.find({
            studentId: student._id
        }).sort({ subjectName: 1, examDate: 1 })

        const grouped = {}
        marks.forEach( m => {
            if (!grouped[m.subjectName]) {
                grouped[m.subjectName] = []
            }
            grouped[m.subjectName].push({
                examTitle: m.examTitle,
                marks: m.marks,
                maxMarks: m.maxMarks,
                examDate: m.examDate,
            })
        })

        const subjects = Object.entries(grouped).map(([subject, exams]) => {
            const totalMarks = exams.reduce((sum, e) => sum + e.marks, 0)
            const totalMax = exams.reduce((sum, e) => sum + e.maxMarks, 0)
            const percentage = totalMax > 0 ? ((totalMarks / totalMax) * 100).toFixed(1) : 0
            return { subject, exams, totalMarks, totalMax, percentage }
        })

        return Response.json({ subjects })
    } catch (error) {
        return Response.json({
            message: 'Failed',
            error: error.message
        }, { status: 500 })
    }
}