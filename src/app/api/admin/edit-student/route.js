import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function PUT(request) {
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

        const body = await request.json();
        const { name, phone, gender, class: cls, 
                section, parentName, parentPhone } = body;

        // Find student
        const student = await Student.findById(id);
        if (!student) {
            return Response.json({ 
                message: 'Student not found' 
            }, { status: 404 });
        }

        // Update Student User
        await User.findByIdAndUpdate(student.userId, {
            name,
            phone,
            gender,
        });

        // Update Parent User
        if (student.parentId) {
            await User.findByIdAndUpdate(student.parentId, {
                name: parentName,
                phone: parentPhone,
            });
        }

        // Update Student
        await Student.findByIdAndUpdate(id, {
            class: cls,
            section,
            gender,
        });

        return Response.json({ 
            message: 'Student updated successfully' 
        });

    } catch (error) {
        return Response.json({ 
            message: 'Failed', 
            error: error.message 
        }, { status: 500 });
    }
}