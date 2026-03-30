import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
import Marks from "@/models/Marks";

export async function GET(request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const teacher = await Teacher.findOne({
      userId: session.user.id,
      isActive: true,
    });
    if (!teacher) {
      return Response.json({ message: "Teacher not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const cls = searchParams.get("class");
    const section = searchParams.get("section");
    const subjectName = searchParams.get("subject");

    const query = { teacherId: teacher._id };
    if (cls) query.class = cls;
    if (section) query.section = section;
    if (subjectName) query.subjectName = subjectName;

    const existingMarks = await Marks.find(query).lean();

    let students = [];
    if (cls && section) {
      const studentDocs = await Student.find({
        class: cls,
        section,
        isActive: true,
      })
        .populate("userId", "name")
        .sort({ createdAt: 1 });

      students = studentDocs.map((s) => ({
        _id: s._id,
        name: s.userId?.name,
      }));
    }

    // group marks by examTitle
    const examMap = {};
    for (const m of existingMarks) {
      const key = `${m.examTitle}||${m.class}||${m.section}||${m.subjectName}`;
      if (!examMap[key]) {
        examMap[key] = {
          examTitle: m.examTitle,
          class: m.class,
          section: m.section,
          subjectName: m.subjectName,
          maxMarks: m.maxMarks,
          examDate: m.examDate,
          marksMap: {},
        };
      }
      examMap[key].marksMap[m.studentId.toString()] = m.marks;
    }

    return Response.json({
      exams: Object.values(examMap),
      students,
      assignments: teacher.assignments,
    });
  } catch (error) {
    console.error("Marks get error", error);
    return Response.json(
      { message: "Failed", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return Response.json(
        {
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { cls, section, subjectName, examTitle, examDate,  maxMarks, marksData } = body;

    const teacher = await Teacher.findOne({
      userId: session.user.id,
      isActive: true,
    });
    if (!teacher) {
      return Response.json(
        {
          message: "Teacher not found",
        },
        { status: 404 },
      );
    }

    const isAssigned = teacher.assignments.some(
      (a) =>
        a.class === cls &&
        a.section === section &&
        a.subjectName === subjectName,
    );
    if (!isAssigned) {
      return Response.json(
        {
          message: "You are not assigned to this class/subject",
        },
        { status: 403 },
      );
    }
    const operations = marksData.map((m) => ({
      updateOne: {
        filter: {
          studentId: m.studentId,
          subjectName,
          examTitle,
          class: cls,
          section,
        },
        update: {
          $set: {
            studentId: m.studentId,
            teacherId: teacher._id,
            subjectName,
            examTitle,
            marks: m.marks,
            maxMarks: maxMarks || 100,
            examDate: examDate ? new Date(examDate) : new Date(),
            class: cls,
            section,
          },
        },
        upsert: true,
      },
    }));

    await Marks.bulkWrite(operations);

    return Response.json({
      message: "Marks saved successfully",
    });
  } catch (error) {
    return Response.json(
      {
        message: "Failed",
        error: error.message,
      },
      { status: 500 },
    );
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
        const cls = searchParams.get('class')
        const section = searchParams.get('section')
        const subjectName = searchParams.get('subject')
        const examTitle = searchParams.get('examTitle')

        if (!cls || !section || !subjectName || !examTitle) {
            return Response.json({ message: 'All fields required' }, { status: 400 })
        }

        const teacher = await Teacher.findOne({ userId: session.user.id, isActive: true })
        if (!teacher) {
            return Response.json({ message: 'Teacher not found' }, { status: 404 })
        }

        await Marks.deleteMany({
            class: cls,
            section,
            subjectName,
            examTitle,
            teacherId: teacher._id
        })

        return Response.json({ message: 'Exam deleted successfully' })
    } catch (error) {
        return Response.json({ message: 'Failed', error: error.message }, { status: 500 })
    }
}
