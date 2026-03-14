import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Student from "@/models/Student";

export async function GET() {
    try {
        await connectDB()

        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'admin') {
            return Response.json({
                message: 'Unauthorized'
            }, { status: 401 } )
        }

        const totalTeachers = await User.countDocuments({
            role: 'teacher',
            isActive: true
        })
        const totalStudents = await User.countDocuments({
            role: 'student',
            isActive: true
        })
        const totalParents = await User.countDocuments({
            role: "parent",
            isActive: true
        })

        // Students by class
        const byclass = await Student.aggregate([
            { $match: { isActive: true }},
            { $group: { _id: '$class', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ])

        // Gender Stats
        const byGender = await Student.aggregate([
            { $match: { isActive: true }},
            { $group: { _id: '$gender', count: { $sum: 1 }}}
        ])

        // Format gender data
         const genderMap = { male: 0, female: 0, other: 0 }
        byGender.forEach(g => {
            if (g._id) genderMap[g._id] = g.count
        })

        return Response.json({
            totalTeachers,
            totalStudents,
            totalParents,
            studentsByClass: byclass.map(s => ({
                class: `Class ${s._id}`,
                count: s.count
            })),
            genderData: [
                { name: 'Male', value: genderMap.male, color: '#0E9EAD' },
                { name: 'Female', value: genderMap.female, color: '#2EAF4D' },
                { name: 'Other', value: genderMap.other, color: '#F97316' },
            ].filter(g => g.value > 0)
        })
        
    } catch (error) {
        return Response.json({
            message: "Failed",
            error: error.message
        }, { status: 500 } )
    }
}