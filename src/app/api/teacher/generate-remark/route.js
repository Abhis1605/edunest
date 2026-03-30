import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export const runtime = "nodejs"; // important for SDK

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    console.log("API HIT");

    console.log("API KEY:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");

    // Session check
    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session || session.user.role !== "teacher") {
      console.log("Unauthorized access");
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    //Body parsing
    const body = await request.json();
    console.log("📦 Request Body:", body);

    const { studentName, subjectName, class: cls } = body;

    if (!studentName || !subjectName) {
      console.log("Missing fields");
      return Response.json(
        { message: "Student name and subject are required" },
        { status: 400 }
      );
    }

    //Prompt
    const prompt = `
You are a school teacher writing report card remarks for students of classes 8 to 10.

Student Name: ${studentName}
Subject: ${subjectName}
Class: ${cls}
Marks: ${body.marks}
Attendance: ${body.attendance}%

Write a short and simple remark (max 2 sentences).

Rules:
- Use very simple school-level English (no complex words)
- Make it sound natural and human, not AI-generated
- Keep it short (1–2 lines only)
- Mention performance based on marks:
  - High marks → praise
  - Medium → average comment
  - Low → needs improvement
- Mention attendance if low (<75%)
- Add one small suggestion if needed

Tone: friendly and realistic like a school teacher

Output only the remark.
`;

    console.log("Prompt:", prompt);

    // Model init
    console.log("Initializing model...");
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // API call
    console.log("Calling Gemini API...");
    const result = await model.generateContent(prompt);

    console.log("Raw Result:", result);

    const response = await result.response;
    console.log("Response Object:", response);

    const text = response.text();
    console.log("Generated Text:", text);

    if (!text) {
      console.log("Empty response from Gemini");
      return Response.json(
        { message: "Failed to generate remark" },
        { status: 500 }
      );
    }

    console.log("Success");

    return Response.json({ remark: text });

  } catch (error) {
    console.error("ERROR OCCURRED:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("Full Error:", error);

    return Response.json(
      {
        message: "Failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}