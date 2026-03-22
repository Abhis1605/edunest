import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Student from "@/models/Student";
import Attendance from "@/models/Attendance";


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

        const attendance = await Attendance.find({
            studentId: student._id
        }).sort({ date: -1 })

        const totalDays = attendance.length
        const presentDays = attendance.filter(
            a => a.status === 'present'
        ).length
        const absentDays = totalDays - presentDays
        const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0

        const monthlyMap = {}
        attendance.forEach( a => {
            const date = new Date(a.date)
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1 ).padStart(2, '0')}`
            const label = date.toLocaleDateString('en-IN', {
                month: 'long', year: 'numeric'
            })
            if (!monthlyMap[key]) {
                monthlyMap[key] = {
                    key, label, present: 0,
                    absent: 0, total: 0
                }
            }
            monthlyMap[key].total++
            if (a.status === 'present') {
                monthlyMap[key].present++
            } else {
                monthlyMap[key].absent++ 
            }
        })

        const monthly = Object.values(monthlyMap)
        .sort((a, b) => b.key.localeCompare(a.key))

        const recent = attendance.slice(0, 30).map(a => ({
            date: a.date,
            status: a.status,
        }))

        return Response.json({
            stats: {
                totalDays,
                presentDays,
                absentDays,
                percentage
            },
            monthly,
            recent,
        })
    } catch (error) {
        return Response.json({
            message: 'Failed',
            error: error.message
        }, { status: 500 })
    }
}