import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return Response.json({ 
                message: 'Unauthorized' 
            }, { status: 401 });
        }

        const students = await Student.find({ isActive: true })
            .populate('userId', 'name email phone gender')
            .populate('parentId', 'name email phone')
            .sort({ createdAt: -1 });

        return Response.json({ students });

    } catch (error) {
        return Response.json({ 
            message: 'Failed', 
            error: error.message 
        }, { status: 500 });
    }
}