import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Student from "@/models/Student";
import Attendance from "@/models/Attendance";
import Marks from "@/models/Marks";
import Homework from "@/models/Homework";
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
        }).populate('userId', 'name email')

        if (!student) {
            return Response.json({
                message: 'No student linked to this account'
            }, { status: 404 })
        }

        const { class: cls, section } = student

        const totalAttendance = await Attendance.countDocuments({
            studentId: student._id
        })
        const presentCount = await Attendance.countDocuments({
            studentId: student._id,
            status: 'present'
        })
        const attendancePercent = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100 ).toFixed(1) : 0

        const recentMarks = await Marks.find({
            studentId: student._id
        }).sort({ createdAt: -1 }).limit(5)

        const subjects = await Marks.distinct('subjectName', {
            studentId: student._id
        })

        const homework = await Homework.find({
            class: cls,
            section,
            isActive: true,
            dueDate: { $gte: new Date() }
        }).sort({ dueDate: 1 }).limit(5)

        const remarks = await Remark.find({
            studentId: student._id
        }).sort({ ccreatedAt: -1 }).limit(5)

        const attendanceData = [
            { name: 'Present', value: presentCount, color: '#2EAF4D'},
            { name: 'Absent', value: totalAttendance - presentCount, color: '#EF4444'},
        ].filter(d => d.value > 0 )


        return Response.json({
            student: {
                name: student.userId?.name,
                email: student.userId?.email,
                class: cls,
                section
            },
            stats: {
                attendancePercent,
                totalPresent: presentCount,
                totalDays: totalAttendance,
                totalSubjects: subjects.length,
                pendingHomework: homework.length
            },
            recentMarks,
            attendanceData,
            homework,
            remarks
        })
    } catch (error) {
        return Response.json({
            message: 'Failed',
            error: error.message
        }, { status: 500 })
    }
}