import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Student from "@/models/Student";
import Remark from "@/models/Remark";


export async function GET() {
    try {
        await connectDB()

        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'parent') {
            return Response.json({
                message: 'Unauthorized'
            }, { status: 401 })
        }

        const student = await Student.findOne({
            parentId: session.user.id,
            isActive: true
        }).populate('userId', 'name')

        if (!student) {
            return Response.json({
                message: 'No student linked to this account'
            }, { status: 404 })
        }

        const remarks = await Remark.find({
            studentId: student._id
        }).sort({ createdAt: -1 })

        const grouped = {}
        remarks.forEach(r => {
            if (!grouped[r.subjectName]) {
                grouped[r.subjectName] = []
            }
            grouped[r.subjectName].push({
                content: r.content,
                isAiGenerated: r.isAiGenerated,
                createdAt: r.createdAt,
            })
        });

        const subjects = Object.entries(grouped).map(
            ([subject, remarks]) => ({ subject, remarks })
        )

        return Response.json({
            studentName: student.userId?.name,
            subjects,
        })
    } catch (error) {
        return Response.json({
            message: 'Failed', 
            error: error.message
        }, { status: 500 })
    }
}