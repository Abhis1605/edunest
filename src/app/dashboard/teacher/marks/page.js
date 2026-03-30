"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export default function MarksPage() {
  const [exams, setExams] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null); // null = add mode

  // drawer form fields
  const [formTitle, setFormTitle] = useState("");
  const [formClass, setFormClass] = useState("");
  const [formSection, setFormSection] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [formMaxMarks, setFormMaxMarks] = useState(100);
  const [formStudents, setFormStudents] = useState([]); // [{_id, name, marks}]
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // inline edit state
  const [inlineEditingKey, setInlineEditingKey] = useState(null);
  const [inlineDraft, setInlineDraft] = useState({});
  const [inlineSaving, setInlineSaving] = useState(false);

  useEffect(() => {
    loadAllMarks();
  }, []);

  const loadAllMarks = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/teacher/marks");
      setExams(data.exams || []);
      setAssignments(data.assignments || []);
    } catch {
      toast.error("Failed to load marks");
    } finally {
      setLoading(false);
    }
  };

  // derived assignment options
  const uniqueClasses = [...new Set(assignments.map((a) => a.class))];
  const sectionsForClass = [
    ...new Set(
      assignments.filter((a) => a.class === formClass).map((a) => a.section),
    ),
  ];
  const subjectsForClassSection = [
    ...new Set(
      assignments
        .filter((a) => a.class === formClass && a.section === formSection)
        .map((a) => a.subjectName),
    ),
  ];

  // exam key for uniqueness
  const examKey = (exam) =>
    `${exam.examTitle}||${exam.class}||${exam.section}||${exam.subjectName}`;

  // fetch students when class+section selected in drawer
  const fetchStudentsForDrawer = async (cls, section) => {
    if (!cls || !section) {
      setFormStudents([]);
      return;
    }
    setLoadingStudents(true);
    try {
      const data = await api.get(
        `/api/teacher/marks?class=${cls}&section=${section}`,
      );
      setFormStudents((data.students || []).map((s) => ({ ...s, marks: "" })));
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  const openAddDrawer = () => {
    setEditingExam(null);
    setFormTitle("");
    setFormClass("");
    setFormSection("");
    setFormSubject("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormMaxMarks(100);
    setFormStudents([]);
    setDrawerOpen(true);
  };

  const openEditDrawer = (exam, studentsWithMarks) => {
    setEditingExam(exam);
    setFormTitle(exam.examTitle);
    setFormClass(exam.class);
    setFormSection(exam.section);
    setFormSubject(exam.subjectName);
    setFormDate(
      exam.examDate
        ? new Date(exam.examDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    );
    setFormMaxMarks(exam.maxMarks);
    setFormStudents(studentsWithMarks);
    setDrawerOpen(true);
  };

  const handleFormMarkChange = (studentId, value) => {
    const num = Number(value);
    if (value !== "" && num > formMaxMarks) return;
    if (value !== "" && num < 0) return;
    setFormStudents((prev) =>
      prev.map((s) => (s._id === studentId ? { ...s, marks: value } : s)),
    );
  };

  const handleSubmitDrawer = async () => {
    if (!formTitle.trim()) {
      toast.error("Enter exam title");
      return;
    }
    if (!formClass) {
      toast.error("Select class");
      return;
    }
    if (!formSection) {
      toast.error("Select section");
      return;
    }
    if (!formSubject) {
      toast.error("Select subject");
      return;
    }
    if (!formMaxMarks || formMaxMarks < 1) {
      toast.error("Enter valid max marks");
      return;
    }

    const unfilled = formStudents.filter(
      (s) => s.marks === "" || s.marks === null || s.marks === undefined,
    );
    if (unfilled.length > 0) {
      toast.error(`Fill marks for all ${unfilled.length} students`);
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/teacher/marks", {
        cls: formClass,
        section: formSection,
        subjectName: formSubject,
        examTitle: formTitle.trim(),
        maxMarks: formMaxMarks,
        examDate: formDate,
        marksData: formStudents.map((s) => ({
          studentId: s._id,
          marks: parseInt(s.marks),
        })),
      });
      toast.success("Marks saved successfully!");
      setDrawerOpen(false);
      loadAllMarks();
    } catch {
      toast.error("Failed to save marks");
    } finally {
      setSubmitting(false);
    }
  };

 const handleDeleteExam = (exam) => {
    toast('Are you sure you want to delete this exam?', {
        description: `"${exam.examTitle}" and all its marks will be permanently deleted.`,
        action: {
            label: 'Delete',
            onClick: async () => {
                try {
                    await api.delete(
                        `/api/teacher/marks?class=${exam.class}&section=${exam.section}&subject=${encodeURIComponent(exam.subjectName)}&examTitle=${encodeURIComponent(exam.examTitle)}`
                    )
                    setExams(prev => prev.filter(e => examKey(e) !== examKey(exam)))
                    toast.success(`"${exam.examTitle}" deleted`)
                } catch {
                    toast.error('Failed to delete exam')
                }
            }
        },
        cancel: {
            label: 'Cancel',
            onClick: () => {}
        }
    })
}

  // inline edit
  const startInlineEdit = (exam, studentsWithMarks) => {
    const key = examKey(exam);
    setInlineEditingKey(key);
    const draft = {};
    studentsWithMarks.forEach((s) => {
      draft[s._id] = s.marks;
    });
    setInlineDraft(draft);
  };

  const cancelInlineEdit = () => {
    setInlineEditingKey(null);
    setInlineDraft({});
  };

  const handleInlineDraftChange = (studentId, value, maxMarks) => {
    const num = Number(value);
    if (value !== "" && num > maxMarks) return;
    if (value !== "" && num < 0) return;
    setInlineDraft((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleInlineSave = async (exam, studentsWithMarks) => {
    const unfilled = studentsWithMarks.filter(
      (s) =>
        inlineDraft[s._id] === "" ||
        inlineDraft[s._id] === undefined ||
        inlineDraft[s._id] === null,
    );
    if (unfilled.length > 0) {
      toast.error(`Fill marks for all ${unfilled.length} students`);
      return;
    }

    setInlineSaving(true);
    try {
      await api.post("/api/teacher/marks", {
        cls: exam.class,
        section: exam.section,
        subjectName: exam.subjectName,
        examTitle: exam.examTitle,
        maxMarks: exam.maxMarks,
        examDate: exam.examDate,
        marksData: studentsWithMarks.map((s) => ({
          studentId: s._id,
          marks: parseInt(inlineDraft[s._id]),
        })),
      });
      toast.success("Marks updated!");
      setInlineEditingKey(null);
      setInlineDraft({});
      loadAllMarks();
    } catch {
      toast.error("Failed to update marks");
    } finally {
      setInlineSaving(false);
    }
  };

  const getMarkColor = (marks, maxMarks) => {
    const pct = marks / maxMarks;
    if (pct >= 0.7) return "text-green-500";
    if (pct >= 0.4) return "text-yellow-500";
    return "text-red-500";
  };

  // build students list for an exam from marksMap
  // we don't have student names in exams, so we show studentId
  // BUT since we reload after save, we need names — so store them on load
  // Actually marksMap only has studentId:marks, we need names
  // We'll fetch per accordion open — better: store names in exams on load
  // For now render from marksMap with just marks, names come from a separate fetch
  // SIMPLEST: store studentsData separately keyed by class+section

  const [studentsCache, setStudentsCache] = useState({}); // key: "class||section" => [{_id, name}]

  const getStudentsForExam = async (exam) => {
    const cacheKey = `${exam.class}||${exam.section}`;
    if (studentsCache[cacheKey]) return studentsCache[cacheKey];
    try {
      const data = await api.get(
        `/api/teacher/marks?class=${exam.class}&section=${exam.section}`,
      );
      const students = data.students || [];
      setStudentsCache((prev) => ({ ...prev, [cacheKey]: students }));
      return students;
    } catch {
      return [];
    }
  };

  const [expandedStudents, setExpandedStudents] = useState({});

  const handleAccordionOpen = async (exam) => {
    const key = examKey(exam);
    if (expandedStudents[key]) return;
    const students = await getStudentsForExam(exam);
    const withMarks = students.map((s) => ({
      ...s,
      marks: exam.marksMap[s._id.toString()] ?? "—",
    }));
    setExpandedStudents((prev) => ({ ...prev, [key]: withMarks }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Marks</h1>
          <p className="text-muted-foreground mt-1">
            Manage exam marks for your students
          </p>
        </div>
        <button
          onClick={openAddDrawer}
          className="px-4 py-2 bg-[#0E9EAD] text-white rounded-lg
                    text-sm font-medium hover:bg-[#0C8A98] transition-colors"
        >
          + Add Marks
        </button>
      </div>

      {loading ? (
        <div
          className="bg-card border border-border rounded-xl
                px-5 py-10 text-center"
        >
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      ) : exams.length === 0 ? (
        <div
          className="bg-card border border-border rounded-xl
                px-5 py-10 text-center"
        >
          <p className="text-sm text-muted-foreground">No marks added yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click "+ Add Marks" to get started.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Accordion type="single" collapsible className="w-full">
            {exams.map((exam, idx) => {
              const key = examKey(exam);
              const isInlineEditing = inlineEditingKey === key;
              const studentsWithMarks = expandedStudents[key] || [];

              return (
                <AccordionItem
                  key={key}
                  value={key}
                  className={idx !== 0 ? "border-t border-border" : ""}
                >
                  <AccordionTrigger
                    onClick={() => handleAccordionOpen(exam)}
                    className="px-5 py-4 hover:no-underline
        hover:bg-accent/20 transition-colors"
                  >
                    <div className="text-left">
                      <p className="font-semibold text-foreground text-sm">
                        {exam.examTitle}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {exam.subjectName} · Class {exam.class} {exam.section}·
                        Max: {exam.maxMarks}
                        {exam.examDate && (
                          <>
                            {" "}
                            ·{" "}
                            {new Date(exam.examDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pb-0">
                    <div className="border-t border-border">
                      {/* Edit / Delete buttons moved here */}
                      <div
                        className="flex items-center justify-end gap-2 px-5 py-3
            border-b border-border bg-accent/10"
                      >
                        <button
                          onClick={() => {
                            if (studentsWithMarks.length > 0) {
                              startInlineEdit(exam, studentsWithMarks);
                            } else {
                              handleAccordionOpen(exam).then(() => {
                                const s = expandedStudents[key] || [];
                                startInlineEdit(exam, s);
                              });
                            }
                          }}
                          className="text-xs px-2.5 py-1 rounded-md
                    bg-accent text-foreground hover:bg-accent/80
                    transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam)}
                          className="text-xs px-2.5 py-1 rounded-md
                    bg-red-100 dark:bg-red-900/30 text-red-500
                    hover:bg-red-200 dark:hover:bg-red-900/50
                    transition-colors"
                        >
                          Delete
                        </button>
                      </div>

                      {studentsWithMarks.length === 0 ? (
                        <div className="px-5 py-6 text-center">
                          <p className="text-sm text-muted-foreground">
                            Loading students...
                          </p>
                        </div>
                      ) : (
                        <>
                          <table className="w-full">
                            <thead>
                              <tr className="bg-accent/30 border-b border-border">
                                <th
                                  className="text-left text-xs font-medium
                                text-muted-foreground px-5 py-3 w-10"
                                >
                                  #
                                </th>
                                <th
                                  className="text-left text-xs font-medium
                                text-muted-foreground px-5 py-3"
                                >
                                  Student
                                </th>
                                <th
                                  className="text-right text-xs font-medium
                                text-muted-foreground px-5 py-3 w-40"
                                >
                                  Marks / {exam.maxMarks}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentsWithMarks.map((student, i) => {
                                const val = isInlineEditing
                                  ? (inlineDraft[student._id] ?? "")
                                  : student.marks;
                                const isNum = val !== "—" && val !== "";
                                const pct = isNum
                                  ? Number(val) / exam.maxMarks
                                  : null;

                                return (
                                  <tr
                                    key={student._id}
                                    className="border-b border-border
                                        last:border-0 hover:bg-accent/20
                                        transition-colors"
                                  >
                                    <td
                                      className="px-5 py-3 text-sm
                                        text-muted-foreground"
                                    >
                                      {i + 1}
                                    </td>
                                    <td
                                      className="px-5 py-3 text-sm
                                        font-medium text-foreground"
                                    >
                                      {student.name}
                                    </td>
                                    <td className="px-5 py-3">
                                      <div
                                        className="flex items-center
                                            justify-end gap-2"
                                      >
                                        {isInlineEditing ? (
                                          <>
                                            <input
                                              type="number"
                                              value={val}
                                              min={0}
                                              max={exam.maxMarks}
                                              onChange={(e) =>
                                                handleInlineDraftChange(
                                                  student._id,
                                                  e.target.value,
                                                  exam.maxMarks,
                                                )
                                              }
                                              placeholder="0"
                                              className="w-20 text-sm
                                                            px-3 py-1 rounded-lg
                                                            border border-border
                                                            bg-background text-foreground
                                                            focus:outline-none focus:ring-1
                                                            focus:ring-[#0E9EAD] text-center"
                                            />
                                            <span
                                              className="text-xs
                                                        text-muted-foreground"
                                            >
                                              /{exam.maxMarks}
                                            </span>
                                          </>
                                        ) : (
                                          <span
                                            className={`text-sm font-semibold ${
                                              pct !== null
                                                ? getMarkColor(
                                                    Number(val),
                                                    exam.maxMarks,
                                                  )
                                                : "text-muted-foreground"
                                            }`}
                                          >
                                            {isNum
                                              ? `${val}/${exam.maxMarks}`
                                              : "—"}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>

                          {isInlineEditing && (
                            <div
                              className="px-5 py-4 border-t border-border
                        flex items-center justify-between bg-accent/20"
                            >
                              <p className="text-sm text-muted-foreground">
                                Editing · Max {exam.maxMarks} marks
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={cancelInlineEdit}
                                  className="px-4 py-2 bg-accent
                                    text-foreground rounded-lg text-sm
                                    hover:bg-accent/80 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() =>
                                    handleInlineSave(exam, studentsWithMarks)
                                  }
                                  disabled={inlineSaving}
                                  className="px-6 py-2 bg-[#0E9EAD]
                                    text-white rounded-lg text-sm font-medium
                                    hover:bg-[#0C8A98] transition-colors
                                    disabled:opacity-50"
                                >
                                  {inlineSaving ? "Saving..." : "Save"}
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      )}

      {/* Add / Edit Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto px-6">
          <SheetHeader className="mb-6">
            <SheetTitle>{editingExam ? "Edit Exam" : "Add Marks"}</SheetTitle>
            <SheetDescription>
              {editingExam
                ? `Editing "${editingExam.examTitle}"`
                : "Create a new exam and enter marks"}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4">
            {/* Exam Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">
                Exam Title
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Mini Test Chap 1"
                className="text-sm px-3 py-2 rounded-lg border
                                border-border bg-background text-foreground
                                focus:outline-none focus:ring-1 focus:ring-[#0E9EAD]"
              />
            </div>

            {/* Class */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Class</label>
              <select
                value={formClass}
                onChange={(e) => {
                  setFormClass(e.target.value);
                  setFormSection("");
                  setFormSubject("");
                  setFormStudents([]);
                }}
                className="text-sm px-3 py-2 rounded-lg border
                                border-border bg-background text-foreground
                                focus:outline-none focus:ring-1 focus:ring-[#0E9EAD]"
              >
                <option value="">Select Class</option>
                {uniqueClasses.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Section */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Section</label>
              <select
                value={formSection}
                onChange={(e) => {
                  setFormSection(e.target.value);
                  setFormSubject("");
                  fetchStudentsForDrawer(formClass, e.target.value);
                }}
                disabled={!formClass}
                className="text-sm px-3 py-2 rounded-lg border
                                border-border bg-background text-foreground
                                focus:outline-none focus:ring-1 focus:ring-[#0E9EAD]
                                disabled:opacity-50"
              >
                <option value="">Select Section</option>
                {sectionsForClass.map((s) => (
                  <option key={s} value={s}>
                    Section {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Subject</label>
              <select
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                disabled={!formSection}
                className="text-sm px-3 py-2 rounded-lg border
                                border-border bg-background text-foreground
                                focus:outline-none focus:ring-1 focus:ring-[#0E9EAD]
                                disabled:opacity-50"
              >
                <option value="">Select Subject</option>
                {subjectsForClassSection.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Exam Date</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="text-sm px-3 py-2 rounded-lg border
                                border-border bg-background text-foreground
                                focus:outline-none focus:ring-1 focus:ring-[#0E9EAD]"
              />
            </div>

            {/* Max Marks */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Max Marks</label>
              <input
                type="number"
                value={formMaxMarks}
                min={1}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setFormMaxMarks(val);
                  // re-validate any marks already entered
                  setFormStudents((prev) =>
                    prev.map((s) => ({
                      ...s,
                      marks: Number(s.marks) > val ? "" : s.marks,
                    })),
                  );
                }}
                className="text-sm px-3 py-2 rounded-lg border
                                border-border bg-background text-foreground
                                focus:outline-none focus:ring-1 focus:ring-[#0E9EAD]"
              />
            </div>

            {/* Students marks entry */}
            {loadingStudents && (
              <p className="text-xs text-muted-foreground">
                Loading students...
              </p>
            )}

            {formStudents.length > 0 && (
              <div
                className="border border-border rounded-xl
                            overflow-hidden"
              >
                <div
                  className="px-4 py-2.5 bg-accent/30
                                border-b border-border"
                >
                  <p className="text-xs font-medium text-muted-foreground">
                    {formStudents.length} students · Max {formMaxMarks} marks
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {formStudents.map((student, i) => (
                    <div
                      key={student._id}
                      className="flex items-center
                                            justify-between px-4 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-5">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {student.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={student.marks}
                          min={0}
                          max={formMaxMarks}
                          onChange={(e) =>
                            handleFormMarkChange(student._id, e.target.value)
                          }
                          placeholder="0"
                          className="w-16 text-sm px-2 py-1
                                                    rounded-lg border border-border
                                                    bg-background text-foreground
                                                    focus:outline-none focus:ring-1
                                                    focus:ring-[#0E9EAD] text-center"
                        />
                        <span className="text-xs text-muted-foreground">
                          /{formMaxMarks}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex-1 px-4 py-2 bg-accent
                                text-foreground rounded-lg text-sm
                                hover:bg-accent/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDrawer}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-[#0E9EAD]
                                text-white rounded-lg text-sm font-medium
                                hover:bg-[#0C8A98] transition-colors
                                disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : editingExam
                    ? "Update Marks"
                    : "Save Marks"}
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
