'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
 
export default function MarksPage() {
    const [assignments, setAssignments] = useState([])
    const [selectedClass, setSelectedClass] = useState('')
    const [selectedSection, setSelectedSection] = useState('')
    const [selectedSubject, setSelectedSubject] = useState('')
    const [loading, setLoading] = useState(false)
    const [fetched, setFetched] = useState(false)
 
    // students list (just names + ids)
    const [students, setStudents] = useState([])
 
    // exams = array of { examTitle, maxMarks, examDate, marksMap: { studentId: marks }, saving }
    const [exams, setExams] = useState([])
 
    // add exam form
    const [showAddForm, setShowAddForm] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [newMaxMarks, setNewMaxMarks] = useState(100)
    const [newExamDate, setNewExamDate] = useState(
        new Date().toISOString().split('T')[0]
    )
 
    useEffect(() => {
        fetchAssignments()
    }, [])
 
    const fetchAssignments = async () => {
        try {
            const data = await api.get('/api/teacher/dashboard')
            setAssignments(data.teacher?.assignments || [])
        } catch {
            toast.error('Failed to load assignments')
        }
    }
 
    const fetchData = async () => {
        if (!selectedClass || !selectedSection || !selectedSubject) {
            toast.error('Please select class, section and subject')
            return
        }
        setLoading(true)
        setFetched(false)
        setExams([])
        try {
            const data = await api.get(
                `/api/teacher/marks?class=${selectedClass}&section=${selectedSection}&subject=${encodeURIComponent(selectedSubject)}`
            )
 
            const studentList = data.students || []
            setStudents(studentList)
 
            // Build exams from rawMarks grouped by examTitle
            const examMap = {}
            for (const m of data.rawMarks || []) {
                const sid = m.studentId.toString()
                if (!examMap[m.examTitle]) {
                    examMap[m.examTitle] = {
                        examTitle: m.examTitle,
                        maxMarks: m.maxMarks,
                        examDate: m.examDate
                            ? new Date(m.examDate).toISOString().split('T')[0]
                            : new Date().toISOString().split('T')[0],
                        marksMap: {},
                        saving: false,
                    }
                }
                examMap[m.examTitle].marksMap[sid] = m.marks
            }
            setExams(Object.values(examMap))
            setFetched(true)
        } catch (err) {
            toast.error('Failed to load data')
            console.error('Marks fetch error', err)
        } finally {
            setLoading(false)
        }
    }
 
    const handleAddExam = () => {
        if (!newTitle.trim()) {
            toast.error('Please enter an exam title')
            return
        }
        const duplicate = exams.find(
            e => e.examTitle.toLowerCase() === newTitle.trim().toLowerCase()
        )
        if (duplicate) {
            toast.error('An exam with this title already exists')
            return
        }
        setExams(prev => [
            ...prev,
            {
                examTitle: newTitle.trim(),
                maxMarks: newMaxMarks,
                examDate: newExamDate,
                marksMap: {},
                saving: false,
            }
        ])
        setNewTitle('')
        setNewMaxMarks(100)
        setNewExamDate(new Date().toISOString().split('T')[0])
        setShowAddForm(false)
    }
 
    const handleMarkChange = (examTitle, studentId, value) => {
        setExams(prev => prev.map(e => {
            if (e.examTitle !== examTitle) return e
            return {
                ...e,
                marksMap: { ...e.marksMap, [studentId]: value }
            }
        }))
    }
 
    const handleSaveExam = async (exam) => {
        // validate all filled
        const unfilled = students.filter(
            s => exam.marksMap[s._id] === '' ||
                 exam.marksMap[s._id] === undefined ||
                 exam.marksMap[s._id] === null
        )
        if (unfilled.length > 0) {
            toast.error(`Fill marks for all ${unfilled.length} remaining students`)
            return
        }
 
        // validate none exceed max
        const overMax = students.find(
            s => Number(exam.marksMap[s._id]) > exam.maxMarks
        )
        if (overMax) {
            toast.error(`Some marks exceed the maximum of ${exam.maxMarks}`)
            return
        }
 
        // set saving true for this exam
        setExams(prev => prev.map(e =>
            e.examTitle === exam.examTitle ? { ...e, saving: true } : e
        ))
 
        try {
            await api.post('/api/teacher/marks', {
                cls: selectedClass,
                section: selectedSection,
                subjectName: selectedSubject,
                examTitle: exam.examTitle,
                maxMarks: exam.maxMarks,
                examDate: exam.examDate,
                marksData: students.map(s => ({
                    studentId: s._id,
                    marks: parseInt(exam.marksMap[s._id])
                }))
            })
            toast.success(`Marks saved for "${exam.examTitle}"`)
        } catch {
            toast.error(`Failed to save marks for "${exam.examTitle}"`)
        } finally {
            setExams(prev => prev.map(e =>
                e.examTitle === exam.examTitle ? { ...e, saving: false } : e
            ))
        }
    }
 
    const handleDeleteExam = async (examTitle) => {
        if (!confirm(`Delete all marks for "${examTitle}"? This cannot be undone.`)) return
        try {
            await api.delete(
                `/api/teacher/marks?class=${selectedClass}&section=${selectedSection}&subject=${encodeURIComponent(selectedSubject)}&examTitle=${encodeURIComponent(examTitle)}`
            )
            setExams(prev => prev.filter(e => e.examTitle !== examTitle))
            toast.success(`"${examTitle}" deleted`)
        } catch {
            toast.error('Failed to delete exam')
        }
    }
 
    // derived filter options
    const uniqueClasses = [...new Set(assignments.map(a => a.class))]
    const sectionsForClass = assignments
        .filter(a => a.class === selectedClass)
        .map(a => a.section)
    const subjectsForClass = assignments
        .filter(a => a.class === selectedClass && a.section === selectedSection)
        .map(a => a.subjectName)
 
    return (
        <div className="space-y-6">
 
            <div>
                <h1 className="text-2xl font-bold text-foreground">Marks</h1>
                <p className="text-muted-foreground mt-1">
                    Enter marks for your students
                </p>
            </div>
 
            {/* Filter Row */}
            <div className="flex flex-wrap items-end gap-4 p-4
            bg-card border border-border rounded-xl">
 
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Class</label>
                    <select
                        value={selectedClass}
                        onChange={(e) => {
                            setSelectedClass(e.target.value)
                            setSelectedSection('')
                            setSelectedSubject('')
                            setFetched(false)
                            setExams([])
                        }}
                        className="text-sm px-3 py-2 rounded-lg border
                        border-border bg-background text-foreground
                        focus:outline-none focus:ring-1
                        focus:ring-[#0E9EAD] min-w-32"
                    >
                        <option value="">Select Class</option>
                        {uniqueClasses.map(c => (
                            <option key={c} value={c}>Class {c}</option>
                        ))}
                    </select>
                </div>
 
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Section</label>
                    <select
                        value={selectedSection}
                        onChange={(e) => {
                            setSelectedSection(e.target.value)
                            setSelectedSubject('')
                            setFetched(false)
                            setExams([])
                        }}
                        disabled={!selectedClass}
                        className="text-sm px-3 py-2 rounded-lg border
                        border-border bg-background text-foreground
                        focus:outline-none focus:ring-1
                        focus:ring-[#0E9EAD] min-w-32 disabled:opacity-50"
                    >
                        <option value="">Select Section</option>
                        {sectionsForClass.map(s => (
                            <option key={s} value={s}>Section {s}</option>
                        ))}
                    </select>
                </div>
 
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Subject</label>
                    <select
                        value={selectedSubject}
                        onChange={(e) => {
                            setSelectedSubject(e.target.value)
                            setFetched(false)
                            setExams([])
                        }}
                        disabled={!selectedSection}
                        className="text-sm px-3 py-2 rounded-lg border
                        border-border bg-background text-foreground
                        focus:outline-none focus:ring-1
                        focus:ring-[#0E9EAD] min-w-36 disabled:opacity-50"
                    >
                        <option value="">Select Subject</option>
                        {subjectsForClass.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
 
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="px-5 py-2 bg-[#0E9EAD] text-white
                    rounded-lg text-sm font-medium hover:bg-[#0C8A98]
                    transition-colors disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Load'}
                </button>
            </div>
 
            {/* Content area */}
            {fetched && (
                <div className="space-y-4">
 
                    {/* Top bar: summary + add exam button */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                                {selectedSubject}
                            </span>
                            {' '}· Class {selectedClass} {selectedSection}
                            {' '}· {students.length} students
                            {' '}· {exams.length} exam{exams.length !== 1 ? 's' : ''}
                        </p>
                        <button
                            onClick={() => setShowAddForm(v => !v)}
                            className="px-4 py-2 bg-[#0E9EAD] text-white
                            rounded-lg text-sm font-medium hover:bg-[#0C8A98]
                            transition-colors"
                        >
                            {showAddForm ? 'Cancel' : '+ Add Exam'}
                        </button>
                    </div>
 
                    {/* Add exam inline form */}
                    {showAddForm && (
                        <div className="flex flex-wrap items-end gap-4 p-4
                        bg-card border border-border rounded-xl">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground">
                                    Exam Title
                                </label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    placeholder="e.g. Mini Test Chap 1"
                                    onKeyDown={e => e.key === 'Enter' && handleAddExam()}
                                    className="text-sm px-3 py-2 rounded-lg border
                                    border-border bg-background text-foreground
                                    focus:outline-none focus:ring-1
                                    focus:ring-[#0E9EAD] min-w-56"
                                />
                            </div>
 
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground">
                                    Max Marks
                                </label>
                                <input
                                    type="number"
                                    value={newMaxMarks}
                                    min={1}
                                    onChange={e => setNewMaxMarks(parseInt(e.target.value) || 100)}
                                    className="text-sm px-3 py-2 rounded-lg border
                                    border-border bg-background text-foreground
                                    focus:outline-none focus:ring-1
                                    focus:ring-[#0E9EAD] w-24"
                                />
                            </div>
 
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground">
                                    Exam Date
                                </label>
                                <input
                                    type="date"
                                    value={newExamDate}
                                    onChange={e => setNewExamDate(e.target.value)}
                                    className="text-sm px-3 py-2 rounded-lg border
                                    border-border bg-background text-foreground
                                    focus:outline-none focus:ring-1
                                    focus:ring-[#0E9EAD]"
                                />
                            </div>
 
                            <button
                                onClick={handleAddExam}
                                className="px-5 py-2 bg-[#0E9EAD] text-white
                                rounded-lg text-sm font-medium hover:bg-[#0C8A98]
                                transition-colors"
                            >
                                Create
                            </button>
                        </div>
                    )}
 
                    {/* No exams yet */}
                    {exams.length === 0 && (
                        <div className="bg-card border border-border
                        rounded-xl px-5 py-10 text-center">
                            <p className="text-sm text-muted-foreground">
                                No exams yet for this subject.
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Click "+ Add Exam" above to create one.
                            </p>
                        </div>
                    )}
 
                    {/* One card per exam */}
                    {exams.map(exam => {
                        const avg = students.length > 0
                            ? (students.reduce((sum, s) =>
                                sum + (parseInt(exam.marksMap[s._id]) || 0), 0
                              ) / students.length).toFixed(1)
                            : 0
 
                        return (
                            <div key={exam.examTitle}
                                className="bg-card border border-border
                                rounded-xl overflow-hidden">
 
                                {/* Exam header */}
                                <div className="flex flex-col sm:flex-row
                                sm:items-center justify-between gap-2
                                px-5 py-4 border-b border-border">
                                    <div>
                                        <h2 className="font-semibold text-foreground">
                                            {exam.examTitle}
                                        </h2>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Max Marks: {exam.maxMarks}
                                            {exam.examDate && (
                                                <> · {new Date(exam.examDate).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}</>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">
                                                Avg
                                            </p>
                                            <p className="text-lg font-bold text-[#0E9EAD]">
                                                {avg}/{exam.maxMarks}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteExam(exam.examTitle)}
                                            className="text-xs px-3 py-1 rounded-md
                                            bg-red-100 dark:bg-red-900/30
                                            text-red-500 hover:bg-red-200
                                            dark:hover:bg-red-900/50
                                            transition-colors font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
 
                                {/* Table */}
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border bg-accent/30">
                                            <th className="text-left text-xs font-medium
                                            text-muted-foreground px-5 py-3 w-12">
                                                #
                                            </th>
                                            <th className="text-left text-xs font-medium
                                            text-muted-foreground px-5 py-3">
                                                Student Name
                                            </th>
                                            <th className="text-right text-xs font-medium
                                            text-muted-foreground px-5 py-3 w-48">
                                                Marks (out of {exam.maxMarks})
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student, i) => {
                                            const val = exam.marksMap[student._id] ?? ''
                                            const pct = val !== ''
                                                ? parseInt(val) / exam.maxMarks
                                                : null
                                            return (
                                                <tr key={student._id}
                                                    className="border-b border-border
                                                    last:border-0 hover:bg-accent/20
                                                    transition-colors">
                                                    <td className="px-5 py-3 text-sm
                                                    text-muted-foreground">
                                                        {i + 1}
                                                    </td>
                                                    <td className="px-5 py-3 text-sm
                                                    font-medium text-foreground">
                                                        {student.name}
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center
                                                        justify-end gap-2">
                                                            <input
                                                                type="number"
                                                                value={val}
                                                                min={0}
                                                                max={exam.maxMarks}
                                                                onChange={e => handleMarkChange(
                                                                    exam.examTitle,
                                                                    student._id,
                                                                    e.target.value
                                                                )}
                                                                placeholder="0"
                                                                className="w-20 text-sm px-3 py-1
                                                                rounded-lg border border-border
                                                                bg-background text-foreground
                                                                focus:outline-none focus:ring-1
                                                                focus:ring-[#0E9EAD] text-center"
                                                            />
                                                            <span className="text-xs text-muted-foreground">
                                                                / {exam.maxMarks}
                                                            </span>
                                                            {pct !== null && (
                                                                <span className={`text-xs font-semibold w-10 text-right ${
                                                                    pct >= 0.7
                                                                        ? 'text-green-500'
                                                                        : pct >= 0.4
                                                                        ? 'text-yellow-500'
                                                                        : 'text-red-500'
                                                                }`}>
                                                                    {Math.round(pct * 100)}%
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
 
                                {/* Footer */}
                                <div className="px-5 py-4 border-t border-border
                                flex items-center justify-between bg-accent/20">
                                    <p className="text-sm text-muted-foreground">
                                        {students.length} students · Max {exam.maxMarks} marks
                                    </p>
                                    <button
                                        onClick={() => handleSaveExam(exam)}
                                        disabled={exam.saving}
                                        className="px-6 py-2 bg-[#0E9EAD] text-white
                                        rounded-lg text-sm font-medium
                                        hover:bg-[#0C8A98] transition-colors
                                        disabled:opacity-50"
                                    >
                                        {exam.saving ? 'Saving...' : 'Save Marks'}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
