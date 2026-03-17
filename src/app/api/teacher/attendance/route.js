import connectDB from '@/lib/mongodb';
import Teacher from '@/models/Teacher';
import Student from '@/models/Student';
import Attendance from '@/models/Attendance';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'teacher') {
            return Response.json({ 
                message: 'Unauthorized' 
            }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const cls = searchParams.get('class');
        const section = searchParams.get('section');
        const date = searchParams.get('date');

        if (!cls || !section || !date) {
            return Response.json({ 
                message: 'Class, section and date are required' 
            }, { status: 400 });
        }

        // Get teacher
        const teacher = await Teacher.findOne({ 
            userId: session.user.id,
            isActive: true 
        });

        if (!teacher) {
            return Response.json({ 
                message: 'Teacher not found' 
            }, { status: 404 });
        }

        // Check if teacher is assigned to this class
        const isAssigned = teacher.assignments.some(
            a => a.class === cls && a.section === section
        );

        if (!isAssigned) {
            return Response.json({ 
                message: 'You are not assigned to this class' 
            }, { status: 403 });
        }

        // Parse date — start and end of day
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        // Check if attendance already taken
        const existingAttendance = await Attendance.find({
            class: cls,
            section: section,
            date: { $gte: startDate, $lte: endDate }
        });

        const alreadyTaken = existingAttendance.length > 0;

        // Get students for this class
        const students = await Student.find({
            class: cls,
            section: section,
            isActive: true
        })
        .populate('userId', 'name')
        .sort({ 'userId.name': 1 });

        // If already taken map existing status to students
        const attendanceMap = {};
        if (alreadyTaken) {
            existingAttendance.forEach(a => {
                attendanceMap[a.studentId.toString()] = a.status;
            });
        }

        const studentsWithStatus = students.map(s => ({
            _id: s._id,
            name: s.userId?.name,
            status: attendanceMap[s._id.toString()] || 'present'
        }));

        return Response.json({
            students: studentsWithStatus,
            alreadyTaken,
            takenBy: alreadyTaken ? existingAttendance[0]?.teacherId : null
        });

    } catch (error) {
        console.log('Get attendance error:', error.message);
        return Response.json({ 
            message: 'Failed', 
            error: error.message 
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'teacher') {
            return Response.json({ 
                message: 'Unauthorized' 
            }, { status: 401 });
        }

        const body = await request.json();
        const { cls, section, date, attendance } = body;

        if (!cls || !section || !date || !attendance) {
            return Response.json({ 
                message: 'All fields are required' 
            }, { status: 400 });
        }

        // Get teacher
        const teacher = await Teacher.findOne({ 
            userId: session.user.id,
            isActive: true 
        });

        if (!teacher) {
            return Response.json({ 
                message: 'Teacher not found' 
            }, { status: 404 });
        }

        // Check if teacher is assigned to this class
        const isAssigned = teacher.assignments.some(
            a => a.class === cls && a.section === section
        );

        if (!isAssigned) {
            return Response.json({ 
                message: 'You are not assigned to this class' 
            }, { status: 403 });
        }

        // Parse date
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        // Check if already taken
        const existing = await Attendance.findOne({
            class: cls,
            section: section,
            date: { $gte: attendanceDate, $lte: endDate }
        });

        if (existing) {
            return Response.json({ 
                message: 'Attendance already taken for this class today' 
            }, { status: 400 });
        }

        // Save attendance for each student
        const records = attendance.map(a => ({
            studentId: a.studentId,
            teacherId: teacher._id,
            date: attendanceDate,
            status: a.status,
            class: cls,
            section: section,
        }));

        await Attendance.insertMany(records);

        return Response.json({ 
            message: 'Attendance saved successfully' 
        });

    } catch (error) {
        console.log('Post attendance error:', error.message);
        return Response.json({ 
            message: 'Failed', 
            error: error.message 
        }, { status: 500 });
    }
}