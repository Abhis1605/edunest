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
      return Response.json(
        {
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const cls = searchParams.get("class");
    const section = searchParams.get("section");
    const subjectName = searchParams.get("subject")

    if (!cls || !section || !subjectName) {
      return Response.json(
        {
          message: "All fields are required",
        },
        { status: 400 },
      );
    }

    // Get teacher
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

    // Check teacher is assigned to this class and subject or not
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

    const students = await Student.find({
      class: cls,
      section,
      isActive: true,
    })
      .populate("userId", "name")
      .sort({ createdAt: 1 });

    const existingMarks = await Marks.find({
      class: cls,
      section,
      subjectName,
      teacherId: teacher._id,
    });

    const examTitles = [...new Set(existingMarks.map((m) => m.examTitle))];

    const marksMap = {};
    existingMarks.forEach((m) => {
      marksMap[m.studentId.toString()] = m.marks;
    });

    const studentsWithMarks = students.map((s) => ({
      _id: s._id,
      name: s.userId?.name,
      marks: marksMap[s._id.toString()] ?? "",
    }));

    return Response.json({
      students: studentsWithMarks,
      examTitles,
      rawMarks: existingMarks.map((m) => ({
        studentId: m.studentId,
        examTitle: m.examTitle,
        marks: m.marks,
        maxMarks: m.maxMarks,
        examDate: m.examDate,
      })),
    });
  } catch (error) {
    console.error('Marks get error', error)
    return Response.json(
      {
        message: "Failed",
        error: error.message,
      },
      { status: 500 },
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
