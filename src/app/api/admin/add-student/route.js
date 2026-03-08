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
        const { name, phone, gender, class: cls, 
                section, parentName, parentPhone } = body;

        // Validate
        if (!name || !gender || !cls || !section || !parentName) {
            return Response.json({ 
                message: 'Please fill all required fields' 
            }, { status: 400 });
        }

        // Get admin shortform
        const admin = await User.findById(session.user.id);
        const shortform = (admin?.schoolShortForm || 'school').toLowerCase();

        // Count existing students for credential number
        const studentCount = await User.countDocuments({ 
            role: 'student' 
        });
        const studentNum = studentCount + 1;

        // Count existing parents for credential number
        const parentCount = await User.countDocuments({ 
            role: 'parent' 
        });
        const parentNum = parentCount + 1;

        // Generate credentials
        const studentCreds = generateCredentials(
            shortform, 'student', studentNum
        );
        const parentCreds = generateCredentials(
            shortform, 'parent', parentNum
        );

        // Check if emails already exist
        const existingStudent = await User.findOne({ 
            email: studentCreds.email 
        });
        if (existingStudent) {
            return Response.json({ 
                message: 'Student already exists' 
            }, { status: 400 });
        }

        // Hash passwords
        const studentHashedPassword = await bcrypt.hash(
            studentCreds.password, 10
        );
        const parentHashedPassword = await bcrypt.hash(
            parentCreds.password, 10
        );

        // Create Parent User
        const newParentUser = await User.create({
            name: parentName,
            email: parentCreds.email,
            password: parentHashedPassword,
            role: 'parent',
            phone: parentPhone,
            isActive: true,
            isProfileComplete: false,
        });

        // Create Student User
        const newStudentUser = await User.create({
            name,
            email: studentCreds.email,
            password: studentHashedPassword,
            role: 'student',
            phone,
            gender,
            isActive: true,
            isProfileComplete: false,
        });

        // Generate roll number
        const rollNo = await Student.generateRollNo(
            cls, section, gender
        );

        // Create Student
        await Student.create({
            userId: newStudentUser._id,
            parentId: newParentUser._id,
            class: cls,
            section,
            gender,
            rollNo,
            admissionYear: new Date().getFullYear().toString(),
            isActive: true,
        });

        return Response.json({
            message: 'Student added successfully',
            credentials: {
                student: {
                    email: studentCreds.email,
                    password: studentCreds.password,
                },
                parent: {
                    email: parentCreds.email,
                    password: parentCreds.password,
                }
            }
        });

    } catch (error) {
        return Response.json({ 
            message: 'Failed', 
            error: error.message 
        }, { status: 500 });
    }
}