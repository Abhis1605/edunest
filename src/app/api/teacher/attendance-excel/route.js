import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
import Attendance from "@/models/Attendance";
import ExcelJS from "exceljs";

export async function GET(request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cls = searchParams.get("class");
    const section = searchParams.get("section");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!cls || !section || !startDate || !endDate) {
      return new Response("All fields required", { status: 400 });
    }

    const teacher = await Teacher.findOne({
      userId: session.user.id,
      isActive: true,
    });
    if (!teacher) {
      return new Response("Teacher not found", { status: 404 });
    }

    const isAssigned = teacher.assignments.some(
      (a) => a.class === cls && a.section === section,
    );
    if (!isAssigned) {
      return new Response("Not assigned to the class", { status: 403 });
    }

    const students = await Student.find({
      class: cls,
      section,
      isActive: true,
    })
      .populate("userId", "name")
      .sort({ createdAt: 1 });

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      class: cls,
      section,
      date: { $gte: start, $lte: end },
    });

    const datesSet = new Set();
    attendance.forEach((a) => {
      const d = new Date(a.date);
      datesSet.add(d.toISOString().split("T")[0]);
    });
    const dates = [...datesSet].sort();

    const attendanceMap = {};
    attendance.forEach((a) => {
      const studentId = a.studentId.toString();
      const date = new Date(a.date).toISOString().split("T")[0];
      if (!attendanceMap[studentId]) {
        attendanceMap[studentId] = {};
      }
      attendanceMap[studentId][date] = a.status === "present" ? "P" : "A";
    });

    const wb = new ExcelJS.Workbook();
    wb.creator = "Edunest";
    wb.created = new Date();

    const ws = wb.addWorksheet(`Class ${cls}${section}`);

    const totalColumns = 2 + dates.length + 4;
    ws.mergeCells(1, 1, 1, totalColumns);

    const titleCell = ws.getCell("A1");
    titleCell.value = `Attendance Register - Class ${cls} Section ${section}`;
    titleCell.font = {
      bold: true,
      size: 14,
      color: { argb: "FFFFFF" },
    };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0E9EAD" },
    };
    titleCell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    ws.getRow(1).height = 35;

    ws.mergeCells(2, 1, 2, totalColumns);
    const dateRangeCell = ws.getCell("A2");
    dateRangeCell.value = `Period: ${new Date(startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} to ${new Date(endDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`;
    dateRangeCell.font = {
      italic: true,
      size: 11,
      color: { argb: "FF555555" },
    };
    dateRangeCell.alignment = { horizontal: "center" };
    ws.getRow(2).height = 20;

    ws.addRow([]);
    const headerValues = [
      "Sr No",
      "Student Name",
      ...dates.map((d) => {
        const date = new Date(d);
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        const day = date.toLocaleString("en-IN", { weekday: "short" });
        return `${formattedDate}\n${day}`;
      }),
      "Present Days",
      "Absent Days",
      "Total Days",
      "Attendance\n%",
    ];

    const headerRow = ws.addRow(headerValues);

    headerRow.height = 35;

    headerRow.eachCell((cell) => {
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      cell.font = { bold: true };

      cell.border = {
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
      };
    });

    const summaryStartCol = dates.length + 3;

    for (let i = summaryStartCol; i <= summaryStartCol + 3; i++) {
      const cell = headerRow.getCell(i);
      cell.font = {
        bold: true,
        color: { argb: "FF1D4ED8" },
      };
    }

    students.forEach((student, index) => {
      const studentId = student._id.toString();
      const dateStatuses = dates.map(
        (d) => attendanceMap[studentId]?.[d] || "-",
      );
      const totalPresent = dateStatuses.filter((s) => s === "P").length;
      const totalAbsent = dateStatuses.filter((s) => s === "A").length;
      const totalDays = totalPresent + totalAbsent;
      const percentage =
        totalDays > 0 ? ((totalPresent / totalDays) * 100).toFixed(1) : "N/A";

      const rowValues = [
        index + 1,
        student.userId?.name,
        ...dateStatuses,
        totalPresent,
        totalAbsent,
        totalDays,
        percentage !== "N/A" ? `${percentage}%` : "N/A",
      ];

      const dataRow = ws.addRow(rowValues);
      dataRow.height = 22;

      const rowBg = index % 2 === 0 ? "FFFAFAFA" : "FFFFFFFF";

      dataRow.eachCell((cell, colNumber) => {
        cell.alignment = {
          horizontal: colNumber <= 2 ? "left" : "center",
          vertical: "middle",
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE5E7EB" } },
          bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
          left: { style: "thin", color: { argb: "FFE5E7EB" } },
          right: { style: "thin", color: { argb: "FFE5E7EB" } },
        };

        const cellValue = cell.value;
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: rowBg },
        };
      });

      // Style percentage cell
      const pctCell = dataRow.getCell(summaryStartCol + 2);
      const pctValue = parseFloat(percentage);
      if (!isNaN(pctValue)) {
        pctCell.font = {
          bold: true,
          color: { argb: pctValue >= 75 ? "FF2EAF4D" : "FFDC3545" },
        };
      }
    });

    ws.getColumn(1).width = 7;
    ws.getColumn(2).width = 25;
    dates.forEach((_, i) => {
      ws.getColumn(i + 3).width = 12;
    });
    ws.getColumn(dates.length + 3).width = 10;
    ws.getColumn(dates.length + 4).width = 10;
    ws.getColumn(dates.length + 5).width = 8;
    ws.getColumn(dates.length + 6).width = 15;

    ws.views = [
      {
        state: "frozen",
        xSplit: 2,
        ySplit: 5,
      },
    ];

    const buffer = await wb.xlsx.writeBuffer();
    const filename = `Attendance Class${cls}${section} ${startDate} to ${endDate}.xlsx`;

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return new Response("Failed", { status: 500 });
  }
}
