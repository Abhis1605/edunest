import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function DELETE(request) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return Response.json({ 
                message: 'Unauthorized' 
            }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        // Find student
        const student = await Student.findById(id);
        if (!student) {
            return Response.json({ 
                message: 'Student not found' 
            }, { status: 404 });
        }

        // Deactivate student user
        await User.findByIdAndUpdate(student.userId, {
            isActive: false
        });

        // Deactivate parent user
        if (student.parentId) {
            await User.findByIdAndUpdate(student.parentId, {
                isActive: false
            });
        }

        // Deactivate student
        await Student.findByIdAndUpdate(id, {
            isActive: false
        });

        return Response.json({ 
            message: 'Student deleted successfully' 
        });

    } catch (error) {
        return Response.json({ 
            message: 'Failed', 
            error: error.message 
        }, { status: 500 });
    }
}
