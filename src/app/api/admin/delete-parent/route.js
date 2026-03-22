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

        // Only deactivate parent user
        await User.findByIdAndUpdate(id, { isActive: false });

        // Remove parentId from student
        await Student.findOneAndUpdate(
            { parentId: id },
            { parentId: null }
        );

        return Response.json({ 
            message: 'Parent deleted successfully' 
        });

    } catch (error) {
        return Response.json({ 
            message: 'Failed', 
            error: error.message 
        }, { status: 500 });
    }
}