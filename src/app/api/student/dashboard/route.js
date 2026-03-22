import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import Attendance from '@/models/Attendance';
import Marks from '@/models/Marks';
import Homework from '@/models/Homework';
import Remark from '@/models/Remark';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'student') {
            return Response.json({ 
                message: 'Unauthorized' 
            }, { status: 401 });
        }

        // Get student
        const student = await Student.findOne({
            userId: session.user.id,
            isActive: true
        }).populate('userId', 'name email');

        console.log('Student found', student)
        console.log('student Id', student?._id)
        console.log('Class', student?.class, 'section:', student?.section)

        if (!student) {
            return Response.json({ 
                message: 'Student not found' 
            }, { status: 404 });
        }

        const { class: cls, section } = student;

        // Get attendance stats
        const totalAttendance = await Attendance.countDocuments({
            studentId: student._id
        });
        const presentCount = await Attendance.countDocuments({
            studentId: student._id,
            status: 'present'
        });
        const attendancePercent = totalAttendance > 0
            ? ((presentCount / totalAttendance) * 100).toFixed(1)
            : 0;

        // Get recent marks
        const recentMarks = await Marks.find({
            studentId: student._id
        }).sort({ createdAt: -1 }).limit(5);

        // Get total subjects
        const subjects = await Marks.distinct('subjectName', {
            studentId: student._id
        });

        // Get active homework
        const homework = await Homework.find({
            class: cls,
            section,
            isActive: true,
            dueDate: { $gte: new Date() }
        }).sort({ dueDate: 1 }).limit(5);

        // Get recent remarks
        const remarks = await Remark.find({
            studentId: student._id
        }).sort({ createdAt: -1 }).limit(5);

        // Attendance chart data
        const attendanceData = [
            { name: 'Present', value: presentCount, color: '#2EAF4D' },
            { name: 'Absent', value: totalAttendance - presentCount, color: '#EF4444' },
        ].filter(d => d.value > 0);

        return Response.json({
            student: {
                name: student.userId?.name,
                email: student.userId?.email,
                class: cls,
                section,
            },
            stats: {
                attendancePercent,
                totalPresent: presentCount,
                totalDays: totalAttendance,
                totalSubjects: subjects.length,
                pendingHomework: homework.length,
            },
            recentMarks,
            attendanceData,
            homework,
            remarks,
        });

    } catch (error) {
        console.log('Student dashboard error:', error.message);
        return Response.json({ 
            message: 'Failed', 
            error: error.message 
        }, { status: 500 });
    }
}