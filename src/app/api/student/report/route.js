import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Student from "@/models/Student";
import Attendance from "@/models/Attendance";
import Marks from "@/models/Marks";
import Remark from "@/models/Remark";


export async function GET() {
    try {
        await connectDB()

        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'student') {
            return Response.json({
                messsage: 'Unauthorized'
            }, { status: 401 })
        }

        const student = await Student.findOne({
            userId: session.user.id,
            isActive : true
        }).populate('userId', 'name email')
        .populate('parentId', 'name phone')

        if (!student) {
            return Response.json({
                messsage: 'Student not found'
            }, { status: 404 })
        }

        const { class: cls, section } = student


        const attendance = await Attendance.find({
            studentId: student._id
        }).sort({ date: 1 })

        const totalDays = attendance.length
        const presentDays = attendance.filter(
            a => a.status === 'present'
        ).length
        const absentDays = totalDays - presentDays
        const attendancePercent = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0
        const monthlyAttendance = {}
        attendance.forEach( a => {
            const date = new Date(a.date)
            const key = date.toLocaleDateString('en-IN', {
                month: 'long', year: 'numeric'
            })
            if (!monthlyAttendance[key]) {
                monthlyAttendance[key] = []
            }
            monthlyAttendance[key].push({
                day: date.getDate(),
                status: a.status === 'present' ? 'P' : 'A'
            })
        })

        const marks = await Marks.find({
            studentId: student._id
        }).sort({ subjectName: 1, examType: 1 })

        const marksGrouped = {}
        marks.forEach( m => {
            if (!marksGrouped[m.subjectName]) {
                marksGrouped[m.subjectName] = []
            }
            marksGrouped[m.subjectName].push({
                examType: m.examType,
                marks: m.marks,
                maxMarks: m.maxMarks,
            })
        })

        const subjects = Object.entries(marksGrouped).map(
            ([subject, exams]) => {
                const totalMarks = exams.reduce(
                    (sum, e) => sum + e.marks, 0
                )
                const totalMax = exams.reduce(
                    (sum, e) => sum + e.maxMarks, 0
                )
                const percentaage = totalMax > 0 ? ((totalMarks / totalMax) * 100).toFixed(1) : 0

                return { subject, exams, totalMarks, totalMax, percentaage }
            }
        )

        const remarks = await Remark.find({
            studentId: student._id
        }).sort({ subjectName: 1 })

        return Response.json({
            student: {
                name: student.userId?.name,
                email: student.userId?.email,
                class: cls,
                section,
                parentName: student.parentId?.name,
                parentPhone: student.parentId?.parentPhone,
            },
            attendance: {
                totalDays,
                presentDays,
                absentDays,
                attendancePercent,
                monthly: monthlyAttendance,
                records: attendance.map( a => ({
                    date: a.date,
                    status: a.status === 'present' ? 'P' : 'A'
                }))
            },
            subjects,
            remarks,
            generatedAt: new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
        })
    } catch (error) {
        return Response.json({
            message: 'Failed',
            error: error.message
        }, { status: 500 })
    }
}