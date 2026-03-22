// import { getServerSession } from "next-auth";
// import { authOptions } from "../../auth/[...nextauth]/route";

// export async function POST(request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== "teacher") {
//       return Response.json(
//         {
//           message: "Unauthorized",
//         },
//         { status: 401 },
//       );
//     }

//     const body = await request.json();
//     const { studentName, subjectName, class: cls } = body;

//     if (!studentName || !subjectName) {
//       return Response.json(
//         {
//           message: "Student name and subject are required",
//         },
//         { status: 400 },
//       );
//     }

//     const prompt = `
// You are a school teacher writing report card remarks.

// Student: ${studentName}
// Subject: ${subjectName}
// Class: ${cls}

// Write a natural, human-like remark in 2–3 sentences.
// Include:
// - One strength
// - One improvement suggestion
// - Subject-specific feedback

// Tone: professional, encouraging, realistic

// Output only the remark.
// `;

//     const response = await fetch(
//   `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
//   {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       contents: [
//         {
//           role: "user",
//           parts: [{ text: prompt }],
//         },
//       ],
//     }),
//   }
// );

//     const data = await response.json();
//     console.log("Gemini full response:", JSON.stringify(data));
//     console.log("Response status:", response.status);

//     const remark = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

//     if (!remark) {
//       return Response.json(
//         {
//           message: "Failed to generate remark",
//         },
//         { status: 500 },
//       );
//     }

//     return Response.json({ remark });
//   } catch (error) {
//     return Response.json(
//       {
//         message: "Failed",
//         error: error.message,
//       },
//       { status: 500 },
//     );
//   }
// }
