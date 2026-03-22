import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { generateCredentials } from '@/lib/generateCredentials';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return Response.json({ 
                message: 'Unauthorized' 
            }, { status: 401 });
        }

        const body = await request.json();
        const { studentId, parentName, parentPhone } = body;

        if (!studentId || !parentName) {
            return Response.json({ 
                message: 'Please fill all required fields' 
            }, { status: 400 });
        }

        // Get admin shortform
        const admin = await User.findById(session.user.id);
        const shortform = (admin?.schoolShortForm || 'school').toLowerCase();

        // Count existing parents
        const parentCount = await User.countDocuments({ role: 'parent' });
        const parentCreds = generateCredentials(
            shortform, 'parent', parentCount + 1
        );

        // Hash password
        const hashedPassword = await bcrypt.hash(parentCreds.password, 10);

        // Create Parent User
        const newParent = await User.create({
            name: parentName,
            email: parentCreds.email,
            password: hashedPassword,
            role: 'parent',
            phone: parentPhone,
            isActive: true,
            isProfileComplete: false,
        });

        // Link parent to student
        await Student.findByIdAndUpdate(studentId, {
            parentId: newParent._id
        });

        return Response.json({
            message: 'Parent added successfully',
            credentials: {
                email: parentCreds.email,
                password: parentCreds.password,
            }
        });

    } catch (error) {
        return Response.json({ 
            message: 'Failed', 
            error: error.message 
        }, { status: 500 });
    }
}