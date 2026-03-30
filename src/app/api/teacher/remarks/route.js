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
            return Response.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const cls = searchParams.get('class')
        const section = searchParams.get('section')
        const subjectName = searchParams.get('subject')

        if (!cls || !section || !subjectName) {
            return Response.json({ message: 'All fields required' }, { status: 400 })
        }

        const teacher = await Teacher.findOne({ userId: session.user.id, isActive: true })
        if (!teacher) return Response.json({ message: 'Teacher not found' }, { status: 404 })

        const isAssigned = teacher.assignments.some(
            a => a.class === cls && a.section === section && a.subjectName === subjectName
        )
        if (!isAssigned) return Response.json({ message: 'Not assigned' }, { status: 403 })

        const students = await Student.find({ class: cls, section, isActive: true })
            .populate('userId', 'name').sort({ createdAt: 1 })

        // get ALL remarks for this class/section/subject, sorted newest first
        const allRemarks = await Remark.find({
            class: cls, section, subjectName, teacherId: teacher._id
        }).sort({ createdAt: -1 })

        // group by studentId
        const remarksMap = {}
        allRemarks.forEach(r => {
            const sid = r.studentId.toString()
            if (!remarksMap[sid]) remarksMap[sid] = []
            remarksMap[sid].push({
                _id: r._id,
                content: r.content,
                isAiGenerated: r.isAiGenerated,
                createdAt: r.createdAt,
            })
        })

        const studentsWithRemarks = students.map(s => ({
            _id: s._id,
            name: s.userId?.name,
            remarks: remarksMap[s._id.toString()] || [],
        }))

        return Response.json({ students: studentsWithRemarks })
    } catch (error) {
        return Response.json({ message: 'Failed', error: error.message }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        await connectDB()
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'teacher') {
            return Response.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { cls, section, subjectName, studentId, content, isAiGenerated } = body

        if (!cls || !section || !subjectName || !studentId || !content?.trim()) {
            return Response.json({ message: 'All fields required' }, { status: 400 })
        }

        const teacher = await Teacher.findOne({ userId: session.user.id, isActive: true })
        if (!teacher) return Response.json({ message: 'Teacher not found' }, { status: 404 })

        const isAssigned = teacher.assignments.some(
            a => a.class === cls && a.section === section && a.subjectName === subjectName
        )
        if (!isAssigned) return Response.json({ message: 'Not assigned' }, { status: 403 })

        // always create new — no upsert
        const remark = await Remark.create({
            studentId,
            teacherId: teacher._id,
            subjectName,
            content: content.trim(),
            isAiGenerated: isAiGenerated || false,
            class: cls,
            section,
        })

        return Response.json({
            message: 'Remark added',
            remark: {
                _id: remark._id,
                content: remark.content,
                isAiGenerated: remark.isAiGenerated,
                createdAt: remark.createdAt,
            }
        })
    } catch (error) {
        return Response.json({ message: 'Failed', error: error.message }, { status: 500 })
    }
}

export async function PUT(request) {
    try {
        await connectDB()
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'teacher') {
            return Response.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { remarkId, content } = body

        if (!remarkId || !content?.trim()) {
            return Response.json({ message: 'remarkId and content required' }, { status: 400 })
        }

        const teacher = await Teacher.findOne({ userId: session.user.id, isActive: true })
        if (!teacher) return Response.json({ message: 'Teacher not found' }, { status: 404 })

        const remark = await Remark.findOneAndUpdate(
            { _id: remarkId, teacherId: teacher._id },
            { $set: { content: content.trim(), isAiGenerated: false } },
            { new: true }
        )

        if (!remark) return Response.json({ message: 'Remark not found' }, { status: 404 })

        return Response.json({ message: 'Updated', remark })
    } catch (error) {
        return Response.json({ message: 'Failed', error: error.message }, { status: 500 })
    }
}

export async function DELETE(request) {
    try {
        await connectDB()
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'teacher') {
            return Response.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const remarkId = searchParams.get('remarkId')

        if (!remarkId) return Response.json({ message: 'remarkId required' }, { status: 400 })

        const teacher = await Teacher.findOne({ userId: session.user.id, isActive: true })
        if (!teacher) return Response.json({ message: 'Teacher not found' }, { status: 404 })

        await Remark.findOneAndDelete({ _id: remarkId, teacherId: teacher._id })

        return Response.json({ message: 'Deleted' })
    } catch (error) {
        return Response.json({ message: 'Failed', error: error.message }, { status: 500 })
    }
}