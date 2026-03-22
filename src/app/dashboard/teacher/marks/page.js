'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export default function MarksPage() {
    const [assignments, setAssignments] = useState([])
    const [selectedClass, setSelectedClass] = useState('')
    const [selectedSection, setSelectedSection] = useState('')
    const [selectedSubject, setSelectedSubject] = useState('')
    const [selectedExam, setSelectedExam] = useState('')
    const [maxMarks, setMaxMarks] = useState(100)
    const [students, setStudents] = useState([])
    const [alreadyEntered, setAlreadyEntered] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [originalMarks, setOriginalMarks] = useState([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [fetched, setFetched] = useState(false)

    const examTypes = [
        { value: 'unit1', label: 'Unit Test 1' },
        { value: 'unit2', label: 'Unit Test 2' },
        { value: 'midterm', label: 'Mid Term' },
        { value: 'final', label: 'Final Exam' },
    ]

    useEffect(() => {
        fetchAssignments()
    }, [])

    const fetchAssignments = async () => {
        try {
            const data = await api.get('/api/teacher/dashboard')
            setAssignments(data.teacher?.assignments || [])
        } catch (error) {
            toast.error('Failed to load assignments')
        }
    }

    const fetchMarks = async () => {
        if (!selectedClass || !selectedSection || 
            !selectedSubject || !selectedExam) {
            toast.error('Please fill all fields')
            return
        }
        setLoading(true)
        setFetched(false)
        try {
            const data = await api.get(
                `/api/teacher/marks?class=${selectedClass}&section=${selectedSection}&subject=${encodeURIComponent(selectedSubject)}&examType=${selectedExam}`
            )
            setStudents(data.students || [])
            setAlreadyEntered(data.alreadyEntered || false)
            setOriginalMarks(data.students || [])
            setIsEditing(!data.alreadyEntered)
            setFetched(true)
        } catch (error) {
            toast.error('Failed to load students')
        } finally {
            setLoading(false)
        }
    }

    const handleMarksChange = (studentId, value) => {
        const num = parseInt(value)
        if (value !== '' && (isNaN(num) || num < 0 || num > maxMarks)) return
        setStudents(students.map(s =>
            s._id === studentId ? { ...s, marks: value } : s
        ))
    }

    const handleSubmit = async () => {
        // Validate all marks filled
        const unfilled = students.filter(
            s => s.marks === '' || s.marks === null || 
                 s.marks === undefined
        )
        if (unfilled.length > 0) {
            toast.error(`Please enter marks for all ${unfilled.length} students`)
            return
        }

        setSubmitting(true)
        try {
            await api.post('/api/teacher/marks', {
                cls: selectedClass,
                section: selectedSection,
                subjectName: selectedSubject,
                examType: selectedExam,
                maxMarks: maxMarks,
                marksData: students.map(s => ({
                    studentId: s._id,
                    marks: parseInt(s.marks)
                }))
            })
            toast.success('Marks saved successfully!')
            setAlreadyEntered(true)
            setIsEditing(false)
            setOriginalMarks([...students])
        } catch (error) {
            toast.error('Failed to save marks')
        } finally {
            setSubmitting(false)
        }
    }

    // Get unique classes
    const uniqueClasses = [...new Set(assignments.map(a => a.class))]

    // Get sections for selected class
    const sectionsForClass = assignments
        .filter(a => a.class === selectedClass)
        .map(a => a.section)

    // Get subjects for selected class+section
    const subjectsForClass = assignments
        .filter(a => a.class === selectedClass && 
                     a.section === selectedSection)
        .map(a => a.subjectName)

    const avgMarks = students.length > 0
        ? (students.reduce((sum, s) => 
            sum + (parseInt(s.marks) || 0), 0
          ) / students.length).toFixed(1)
        : 0

    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-2xl font-bold text-foreground">
                    Marks
                </h1>
                <p className="text-muted-foreground mt-1">
                    Enter marks for your students
                </p>
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap items-end gap-4 p-4
            bg-card border border-border rounded-xl">

                <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">
                        Class
                    </label>
                    <select
                        value={selectedClass}
                        onChange={(e) => {
                            setSelectedClass(e.target.value)
                            setSelectedSection('')
                            setSelectedSubject('')
                            setFetched(false)
                            setStudents([])
                        }}
                        className="text-sm px-3 py-2 rounded-lg
                        border border-border bg-background
                        text-foreground focus:outline-none
                        focus:ring-1 focus:ring-[#0E9EAD] min-w-32"
                    >
                        <option value="">Select Class</option>
                        {uniqueClasses.map(c => (
                            <option key={c} value={c}>Class {c}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">
                        Section
                    </label>
                    <select
                        value={selectedSection}
                        onChange={(e) => {
                            setSelectedSection(e.target.value)
                            setSelectedSubject('')
                            setFetched(false)
                            setStudents([])
                        }}
                        disabled={!selectedClass}
                        className="text-sm px-3 py-2 rounded-lg
                        border border-border bg-background
                        text-foreground focus:outline-none
                        focus:ring-1 focus:ring-[#0E9EAD] min-w-32
                        disabled:opacity-50"
                    >
                        <option value="">Select Section</option>
                        {sectionsForClass.map(s => (
                            <option key={s} value={s}>Section {s}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">
                        Subject
                    </label>
                    <select
                        value={selectedSubject}
                        onChange={(e) => {
                            setSelectedSubject(e.target.value)
                            setFetched(false)
                            setStudents([])
                        }}
                        disabled={!selectedSection}
                        className="text-sm px-3 py-2 rounded-lg
                        border border-border bg-background
                        text-foreground focus:outline-none
                        focus:ring-1 focus:ring-[#0E9EAD] min-w-36
                        disabled:opacity-50"
                    >
                        <option value="">Select Subject</option>
                        {subjectsForClass.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">
                        Exam Type
                    </label>
                    <select
                        value={selectedExam}
                        onChange={(e) => {
                            setSelectedExam(e.target.value)
                            setFetched(false)
                            setStudents([])
                        }}
                        disabled={!selectedSubject}
                        className="text-sm px-3 py-2 rounded-lg
                        border border-border bg-background
                        text-foreground focus:outline-none
                        focus:ring-1 focus:ring-[#0E9EAD] min-w-36
                        disabled:opacity-50"
                    >
                        <option value="">Select Exam</option>
                        {examTypes.map(e => (
                            <option key={e.value} value={e.value}>
                                {e.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">
                        Max Marks
                    </label>
                    <input
                        type="number"
                        value={maxMarks}
                        min={1}
                        max={1000}
                        onChange={(e) => setMaxMarks(parseInt(e.target.value) || 100)}
                        className="text-sm px-3 py-2 rounded-lg
                        border border-border bg-background
                        text-foreground focus:outline-none
                        focus:ring-1 focus:ring-[#0E9EAD] w-24"
                    />
                </div>

                <button
                    onClick={fetchMarks}
                    disabled={loading}
                    className="px-5 py-2 bg-[#0E9EAD] text-white
                    rounded-lg text-sm font-medium
                    hover:bg-[#0C8A98] transition-colors
                    disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Load'}
                </button>
            </div>

            {/* Marks Table */}
            {fetched && (
                <div className="bg-card border border-border
                rounded-xl overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between
                    px-5 py-4 border-b border-border">
                        <div>
                            <h2 className="font-semibold text-foreground">
                                {selectedSubject} — Class {selectedClass} {selectedSection}
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {examTypes.find(e => e.value === selectedExam)?.label} · Max Marks: {maxMarks}
                            </p>
                        </div>
                        {alreadyEntered && (
                            <span className="text-xs px-3 py-1
                            bg-blue-100 dark:bg-blue-900/30
                            text-blue-600 rounded-full">
                                Editing existing marks
                            </span>
                        )}
                        {students.length > 0 && (
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">
                                    Class Average
                                </p>
                                <p className="text-lg font-bold text-[#0E9EAD]">
                                    {avgMarks}/{maxMarks}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    {students.length === 0 ? (
                        <div className="px-5 py-8 text-center">
                            <p className="text-sm text-muted-foreground">
                                No students found.
                            </p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-accent/30">
                                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 w-12">#</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Student Name</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3 w-48">
                                        Marks (out of {maxMarks})
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, i) => (
                                    <tr key={student._id}
                                        className="border-b border-border
                                        last:border-0 hover:bg-accent/20
                                        transition-colors">
                                        <td className="px-5 py-3 text-sm text-muted-foreground">
                                            {i + 1}
                                        </td>
                                        <td className="px-5 py-3 text-sm font-medium text-foreground">
                                            {student.name}
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                               {isEditing ? (
                                                <>
                                                <input type='number' value={student.marks} min={0} 
                                                    max={maxMarks} onChange={(e) => handleMarksChange(
                                                        student._id, e.target.value
                                                    )}
                                                    placeholder='0'
                                                    className='w-20 text-sm px-3 py-1 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#0E9EAD] text-center'
                                                /> 
                                                <span className='text-xs text-muted-foreground'>
                                                    / {maxMarks}
                                                </span>
                                                </>
                                               ) : (
                                                <span className={`text-sm font-semibold ${
                                                    (student.marks / maxMarks) >= 0.7 
                                                    ? 'text-green-500' : (student.marks / maxMarks) >= 0.4
                                                    ? 'text-yellow-500' : 'text-red-500'
                                                }`}>
                                                    {student.marks}/{maxMarks}
                                                </span>
                                               )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Submit Footer */}
                    {students.length > 0 && (
                        <div className="px-5 py-4 border-t border-border
                        flex items-center justify-between bg-accent/20">
                            <p className="text-sm text-muted-foreground">
                                {students.length} students · Max {maxMarks} marks
                            </p>
                            <div className="flex gap-2">
    {isEditing ? (
        <>
            {alreadyEntered && (
                <button
                    onClick={() => {
                        setStudents(originalMarks)
                        setIsEditing(false)
                    }}
                    className="px-4 py-2 bg-accent
                    text-foreground rounded-lg text-sm
                    hover:bg-accent/80 transition-colors"
                >
                    Cancel
                </button>
            )}
            <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-[#0E9EAD]
                text-white rounded-lg text-sm font-medium
                hover:bg-[#0C8A98] transition-colors
                disabled:opacity-50"
            >
                {submitting ? 'Saving...' :
                    alreadyEntered ? 'Update Marks' : 'Submit Marks'
                }
            </button>
        </>
    ) : (
        <button
            onClick={() => {
                setOriginalMarks([...students])
                setIsEditing(true)
            }}
            className="px-6 py-2 bg-accent
            text-foreground rounded-lg text-sm font-medium
            hover:bg-accent/80 transition-colors"
        >
            Edit Marks
        </button>
    )}
</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}