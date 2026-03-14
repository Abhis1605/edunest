import connectDB from '@/lib/mongodb';
import Teacher from '@/models/Teacher';
import Student from '@/models/Student';
import Homework from '@/models/Homework';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'teacher') {
            return Response.json({ 
                message: 'Unauthorized' 
            }, { status: 401 });
        }

        // Get teacher with assignments
        const teacher = await Teacher.findOne({ 
            userId: session.user.id,
            isActive: true 
        }).populate('userId', 'name email');

        if (!teacher) {
            return Response.json({ 
                message: 'Teacher not found' 
            }, { status: 404 });
        }

        // Get unique classes from assignments
        const classes = teacher.assignments.map(a => ({
            class: a.class,
            section: a.section,
            subjectName: a.subjectName,
        }));

        // Count students per assignment
        const classStats = await Promise.all(
            classes.map(async (c) => {
                const count = await Student.countDocuments({
                    class: c.class,
                    section: c.section,
                    isActive: true
                });
                return { ...c, studentCount: count };
            })
        );

        // Get recent homework — last 5
        const recentHomework = await Homework.find({
            teacherId: teacher._id,
            isActive: true
        })
        .sort({ createdAt: -1 })
        .limit(5);

        // Count pending homework
        const pendingHomework = await Homework.countDocuments({
            teacherId: teacher._id,
            isActive: true,
            dueDate: { $gte: new Date() }
        });

        return Response.json({
            teacher: {
                name: teacher.userId?.name,
                email: teacher.userId?.email,
                assignments: classStats,
            },
            pendingHomework,
            recentHomework,
        });

    } catch (error) {
        console.log('Teacher dashboard error:', error.message);
        return Response.json({ 
            message: 'Failed', 
            error: error.message 
        }, { status: 500 });
    }
}