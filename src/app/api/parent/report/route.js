import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Student from "@/models/Student";
import Attendance from "@/models/Attendance";
import Marks from "@/models/Marks";
import Remark from "@/models/Remark";

export async function GET(request) {
    try {
        await connectDB()

        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'parent') {
            return Response.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const student = await Student.findOne({
            parentId: session.user.id,
            isActive: true,
        })
            .populate('userId', 'name email')
            .populate('parentId', 'name phone')

        if (!student) {
            return Response.json({
                message: 'No student linked to this account'
            }, { status: 404 })
        }

        const { class: cls, section } = student

        const { searchParams } = new URL(request.url)
        const from = searchParams.get('from')
        const to = searchParams.get('to')
        const fromDate = from ? new Date(from) : null
        const toDate = to ? new Date(to + 'T23:59:59') : null

        // attendance
        const attendanceQuery = { studentId: student._id }
        if (fromDate && toDate) {
            attendanceQuery.date = { $gte: fromDate, $lte: toDate }
        }
        const attendance = await Attendance.find(attendanceQuery).sort({ date: 1 })

        const totalDays = attendance.length
        const presentDays = attendance.filter(a => a.status === 'present').length
        const absentDays = totalDays - presentDays
        const attendancePercent = totalDays > 0
            ? ((presentDays / totalDays) * 100).toFixed(1) : 0

        const monthlyAttendance = {}
        attendance.forEach(a => {
            const date = new Date(a.date)
            const key = date.toLocaleDateString('en-IN', {
                month: 'long', year: 'numeric'
            })
            if (!monthlyAttendance[key]) monthlyAttendance[key] = []
            monthlyAttendance[key].push({
                day: date.getDate(),
                status: a.status === 'present' ? 'P' : 'A'
            })
        })

        // marks
        const marksQuery = { studentId: student._id }
        if (fromDate && toDate) {
            marksQuery.examDate = { $gte: fromDate, $lte: toDate }
        }
        const marks = await Marks.find(marksQuery).sort({
            subjectName: 1, examDate: 1
        })

        const marksGrouped = {}
        marks.forEach(m => {
            if (!marksGrouped[m.subjectName]) marksGrouped[m.subjectName] = []
            marksGrouped[m.subjectName].push({
                examTitle: m.examTitle,
                marks: m.marks,
                maxMarks: m.maxMarks,
                examDate: m.examDate,
            })
        })

        // highest percentage per subject in class
        const highestMarksData = await Marks.aggregate([
            {
                $lookup: {
                    from: 'students',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'studentDoc'
                }
            },
            { $unwind: '$studentDoc' },
            {
                $match: {
                    'studentDoc.class': cls,
                    'studentDoc.section': section,
                }
            },
            {
                $group: {
                    _id: { studentId: '$studentId', subjectName: '$subjectName' },
                    totalMarks: { $sum: '$marks' },
                    totalMax: { $sum: '$maxMarks' },
                }
            },
            {
                $project: {
                    subjectName: '$_id.subjectName',
                    percentage: {
                        $cond: [
                            { $gt: ['$totalMax', 0] },
                            {
                                $multiply: [
                                    { $divide: ['$totalMarks', '$totalMax'] },
                                    100
                                ]
                            },
                            0
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: '$subjectName',
                    highestPct: { $max: '$percentage' }
                }
            }
        ])

        const subjects = Object.entries(marksGrouped).map(([subject, exams]) => {
            const totalMarks = exams.reduce((sum, e) => sum + e.marks, 0)
            const totalMax = exams.reduce((sum, e) => sum + e.maxMarks, 0)
            const percentage = totalMax > 0
                ? Number(((totalMarks / totalMax) * 100).toFixed(1)) : 0
            const highestObj = highestMarksData.find(h => h._id === subject)
            return {
                subject, exams, totalMarks, totalMax, percentage,
                highestPct: Number((highestObj?.highestPct || 0).toFixed(1))
            }
        })

        const remarks = await Remark.find({
            studentId: student._id
        }).sort({ createdAt: -1 })

        return Response.json({
            student: {
                name: student.userId?.name,
                email: student.userId?.email,
                class: cls,
                section,
                parentName: student.parentId?.name,
                parentPhone: student.parentId?.phone,
                admissionYear: student.admissionYear || 'N/A',
            },
            attendance: {
                totalDays,
                presentDays,
                absentDays,
                attendancePercent,
                monthly: monthlyAttendance,
            },
            subjects,
            remarks,
            generatedAt: new Date().toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
            })
        })
    } catch (error) {
        return Response.json({
            message: 'Failed', error: error.message
        }, { status: 500 })
    }
}