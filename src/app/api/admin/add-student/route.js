import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { generateCredentials } from '@/lib/generateCredentials';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export async function POST(request) {
    await connectDB();

    const authSession = await getServerSession(authOptions);
    if (!authSession || authSession.user.role !== 'admin') {
        return Response.json({ 
            message: 'Unauthorized' 
        }, { status: 401 });
    }

    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
        const body = await request.json();
        const { name, phone, gender, class: cls, 
                section, parentName, parentPhone } = body;

        if (!name || !gender || !cls || !section || !parentName) {
            await dbSession.abortTransaction();
            return Response.json({ 
                message: 'Please fill all required fields' 
            }, { status: 400 });
        }

        // Get admin shortform
        const admin = await User.findById(authSession.user.id);
        const shortform = (admin?.schoolShortForm || 'school').toLowerCase();

        // Count for credentials
        const studentCount = await User.countDocuments({ role: 'student' });
        const parentCount = await User.countDocuments({ role: 'parent' });

        const studentCreds = generateCredentials(
            shortform, 'student', studentCount + 1
        );
        const parentCreds = generateCredentials(
            shortform, 'parent', parentCount + 1
        );

        // Check duplicate
        const existingStudent = await User.findOne({ 
            email: studentCreds.email 
        });
        if (existingStudent) {
            await dbSession.abortTransaction();
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
        const [newParentUser] = await User.create([{
            name: parentName,
            email: parentCreds.email,
            password: parentHashedPassword,
            role: 'parent',
            phone: parentPhone,
            isActive: true,
            isProfileComplete: false,
        }], { session: dbSession });

        // Create Student User
        const [newStudentUser] = await User.create([{
            name,
            email: studentCreds.email,
            password: studentHashedPassword,
            role: 'student',
            phone,
            gender,
            isActive: true,
            isProfileComplete: false,
        }], { session: dbSession });

        // Create Student
        await Student.create([{
            userId: newStudentUser._id,
            parentId: newParentUser._id,
            class: cls,
            section,
            gender,
            admissionYear: new Date().getFullYear().toString(),
            isActive: true,
        }], { session: dbSession });

        console.log("parent created", newParentUser._id)
        console.log('Student created:', newStudentUser._id)

        await dbSession.commitTransaction();

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
        await dbSession.abortTransaction();
        console.log('Add student error:', error.message);
        return Response.json({ 
            message: 'Failed', 
            error: error.message 
        }, { status: 500 });
    } finally {
        dbSession.endSession();
    }
}