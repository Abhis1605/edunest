import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
import Remark from "@/models/Remark";


export async function GET(request) {
    try {
        await connectDB()

        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'teacher') {
            return Response.json({
                message: 'Unauthorized'
            }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const cls = searchParams.get('class')
        const section = searchParams.get('section')
        const subjectName = searchParams.get('subject')

        if (!cls || !section || !subjectName) {
            return Response.json({
                message: 'Class, section, and subject are required'
            }, { status: 400 })
        }

        const teacher = await Teacher.findOne({
            userId: session.user.id, isActive: true
        })
        if (!teacher) {
            return Response.json({
                message: 'Teacher not found'
            }, { status: 404 })
        }

        const isAssigned = teacher.assignments.some(
            a => a.class === cls &&
            a.section === section && 
            a.subjectName === subjectName
        )
        if (!isAssigned) {
            return Response.json({
                message: 'You are not assigned to this class/subject'
            }, { status: 403 })
        }

        const students = await Student.find({
            class: cls, section, isActive: true
        }).populate('userId', 'name').sort({ createdAt: 1 })

        const existingRemarks = await Remark.find({
            class: cls,
            section,
            subjectName,
            teacherId: teacher._id
        })

        const remarksMap = {}
        existingRemarks.forEach(r => {
            remarksMap[r.studentId.toString()] = {
                content: r.content,
                isAiGenerated: r.isAiGenerated,
                _id: r._id,
            }
        })

        const studentsWithRemarks = students.map(s => ({
            _id: s._id,
                name: s.userId?.name,
                remark: remarksMap[s._id.toString()]?.content || '',
                isAiGenerated: remarksMap[s._id.toString()]?.isAiGenerated || false,
                hasRemark: !!remarksMap[s._id.toString()]
        }))

        return Response.json({ students: studentsWithRemarks })

    } catch (error) {
        return Response.json({
            message: 'Failed', error: error.message
        }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        await connectDB()

        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'teacher') {
            return Response.json({
                message: 'Unauthorized'
            }, { status: 401 })
        }

        const body = await request.json()
        const { cls, section, subjectName, remarksData } = body

        const teacher = await Teacher.findOne({
            userId: session.user.id, isActive: true
        })

        if (!teacher) {
            return Response.json({
                message: 'Teacher not found'
            }, { status: 404 })
        }

        const isAssigned = teacher.assignments.some(
            a => a.class === cls && 
            a.section === section && 
            a.subjectName === subjectName
        )
        if (!isAssigned) {
            return Response.json({
                message: 'You are not assigned to this class/subject'
            }, { status: 403 })
        }

        const operations = remarksData.map(r => ({
            updateOne: {
                filter: {
                    studentId: r.studentId,
                    teacherId: teacher._id,
                    subjectName,
                    class: cls,
                    section,
                },
                update: {
                    $set: {
                        studentId: r.studentId,
                        teacherId: teacher._id,
                        subjectName,
                        content: r.remark,
                        isAiGenerated: r.isAiGenerated || false,
                        class: cls,
                        section,
                    }
                },
                upsert: true,
            }
        }))

        await Remark.bulkWrite(operations)

        return Response.json({
            message: 'Remarks saved successfully'
        })
    } catch (error) {
        return Response.json({
            message: "Failed", error: error.message
        }, { status: 500 })
    }
}