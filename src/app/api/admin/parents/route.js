import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Student from "@/models/Student";




export async function GET() {
    try {
        await connectDB()

        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'admin') {
            return Response.json({
                message: "Unauthorized"
            }, { status: 401 })
        }

   // Get all active students with parent info
const students = await Student.find({ isActive: true })
    .populate('userId', 'name email phone')
    .populate('parentId', 'name email phone isActive')
    .sort({ createdAt: -1 });

// Build parents map — filter out inactive parents
const parentsMap = {};
for (const student of students) {
    if (!student.parentId) continue;
    if (!student.parentId.isActive) continue; // ADD THIS LINE

    const parentId = student.parentId._id.toString();

    if (!parentsMap[parentId]) {
        parentsMap[parentId] = {
            _id: student.parentId._id,
            name: student.parentId.name,
            email: student.parentId.email,
            phone: student.parentId.phone,
            isActive: student.parentId.isActive,
            children: []
        };
    }

    parentsMap[parentId].children.push({
        name: student.userId?.name,
        class: student.class,
        section: student.section,
        studentId: student._id,
    });
}

        const parents = Object.values(parentsMap)
        return Response.json({ parents })
    } catch (error) {
        return Response.json({
            message: "Failed",
            error: error.message
        }, { status: 500 })
    }
}