import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
import Attendance from "@/models/Attendance";
import Marks from "@/models/Marks";
import Remark from "@/models/Remark";

export async function GET(request) {
    try {
        await connectDB()

        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'teacher') {
            return Response.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const teacher = await Teacher.findOne({
            userId: session.user.id,
            isActive: true,
        })
        if (!teacher) {
            return Response.json({ message: 'Teacher not found' }, { status: 404 })
        }

        const { searchParams } = new URL(request.url)
        const cls = searchParams.get('class')
        const section = searchParams.get('section')
        const from = searchParams.get('from')
        const to = searchParams.get('to')
        const studentId = searchParams.get('studentId') // optional — for single student

        if (!cls || !section || !from || !to) {
            return Response.json({
                message: 'class, section, from and to are required'
            }, { status: 400 })
        }

        const fromDate = new Date(from)
        const toDate = new Date(to + 'T23:59:59')

        // get students in this class/section
        const studentQuery = { class: cls, section, isActive: true }
        if (studentId) studentQuery._id = studentId

        const students = await Student.find(studentQuery)
            .populate('userId', 'name email')
            .populate('parentId', 'name phone')
            .sort({ createdAt: 1 })

        if (students.length === 0) {
            return Response.json({ students: [] })
        }

        // highest pct per subject for this class/section
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

        // build report data for each student
        const reportsData = await Promise.all(students.map(async (student) => {
            // attendance
            const attendance = await Attendance.find({
                studentId: student._id,
                date: { $gte: fromDate, $lte: toDate }
            }).sort({ date: 1 })

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
            const marks = await Marks.find({
                studentId: student._id,
                examDate: { $gte: fromDate, $lte: toDate }
            }).sort({ subjectName: 1, examDate: 1 })

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

            // remarks
            const remarks = await Remark.find({
                studentId: student._id
            }).sort({ createdAt: -1 })

            return {
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
            }
        }))

        return Response.json({ reports: reportsData })
    } catch (error) {
        return Response.json({
            message: 'Failed', error: error.message
        }, { status: 500 })
    }
}