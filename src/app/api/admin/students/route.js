import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return Response.json({ 
                message: 'Unauthorized' 
            }, { status: 401 });
        }
    
        const { searchParams } = new URL(request.url)
        const filterClass = searchParams.get('class') || ''
        const filterSection = searchParams.get('section') || ''
        const sortOrder = searchParams.get('sort') || 'newest'

        const filter = { isActive: true }
        if (filterClass) filter.class = filterClass
        if (filterSection) filter.section = filterSection

        const sort = sortOrder === "oldest"
        ? { createdAt: 1 } : { createdAt: -1 }

         const students = await Student.find(filter)
            .populate('userId', 'name email phone gender')
            .populate('parentId', 'name email phone')
            .sort(sort);

        return Response.json({ students });

    } catch (error) {
        return Response.json({ 
            message: 'Failed', 
            error: error.message 
        }, { status: 500 });
    }
}