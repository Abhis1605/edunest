'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'

export default function RemarksPage() {
    const [assignments, setAssignments] = useState([])
    const [selectedClass, setSelectedClass] = useState('')
    const [selectedSection, setSelectedSection] = useState('')
    const [selectedSubject, setSelectedSubject] = useState('')
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [fetched, setFetched] = useState(false)
    const [generatingAI, setGeneratingAI] = useState(null)

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

    const fetchRemarks = async () => {
        if (!selectedClass || !selectedSection || !selectedSubject) {
            toast.error('Please select class, section and subject')
            return
        }
        setLoading(true)
        setFetched(false)
        try {
            const data = await api.get(
                `/api/teacher/remarks?class=${selectedClass}&section=${selectedSection}&subject=${encodeURIComponent(selectedSubject)}`
            )
            setStudents(data.students || [])
            setFetched(true)
        } catch (error) {
            toast.error('Failed to load students')
        } finally {
            setLoading(false)
        }
    }

    const handleRemarkChange = (studentId, value) => {
        setStudents(students.map(s =>
            s._id === studentId 
                ? { ...s, remark: value, isAiGenerated: false } 
                : s
        ))
    }

    const generateAIRemark = async (student) => {
        setGeneratingAI(student._id)
        try {
            const response = await fetch('/api/teacher/generate-remark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentName: student.name,
                    subjectName: selectedSubject,
                    class: selectedClass,
                })
            })
            const data = await response.json()
            setStudents(students.map(s =>
                s._id === student._id
                    ? { ...s, remark: data.remark, isAiGenerated: true }
                    : s
            ))
            toast.success('AI remark generated!')
        } catch (error) {
            toast.error('Failed to generate remark')
        } finally {
            setGeneratingAI(null)
        }
    }

    const handleSubmit = async () => {
        const unfilled = students.filter(s => !s.remark?.trim())
        if (unfilled.length > 0) {
            toast.error(`Please add remarks for all ${unfilled.length} students`)
            return
        }
        setSubmitting(true)
        try {
            await api.post('/api/teacher/remarks', {
                cls: selectedClass,
                section: selectedSection,
                subjectName: selectedSubject,
                remarksData: students.map(s => ({
                    studentId: s._id,
                    remark: s.remark,
                    isAiGenerated: s.isAiGenerated || false,
                }))
            })
            toast.success('Remarks saved successfully!')
            fetchRemarks()
        } catch (error) {
            toast.error('Failed to save remarks')
        } finally {
            setSubmitting(false)
        }
    }

    const uniqueClasses = [...new Set(assignments.map(a => a.class))]
    const sectionsForClass = assignments
        .filter(a => a.class === selectedClass)
        .map(a => a.section)
    const subjectsForClass = assignments
        .filter(a => a.class === selectedClass && 
                     a.section === selectedSection)
        .map(a => a.subjectName)

    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-2xl font-bold text-foreground">
                    Remarks
                </h1>
                <p className="text-muted-foreground mt-1">
                    Add remarks for your students
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

                <button
                    onClick={fetchRemarks}
                    disabled={loading}
                    className="px-5 py-2 bg-[#0E9EAD] text-white
                    rounded-lg text-sm font-medium
                    hover:bg-[#0C8A98] transition-colors
                    disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Load'}
                </button>
            </div>

            {/* Remarks Table */}
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
                                {students.length} students
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-500" />
                            <span className="text-xs text-muted-foreground">
                                Click ✨ to generate AI remark
                            </span>
                        </div>
                    </div>

                    {/* Table */}
                    {students.length === 0 ? (
                        <div className="px-5 py-8 text-center">
                            <p className="text-sm text-muted-foreground">
                                No students found.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {students.map((student, i) => (
                                <div key={student._id}
                                    className="px-5 py-4 hover:bg-accent/20
                                    transition-colors">
                                    <div className="flex items-start
                                    justify-between gap-4">
                                        <div className="flex items-center
                                        gap-3 min-w-32">
                                            <span className="text-xs
                                            text-muted-foreground w-5">
                                                {i + 1}
                                            </span>
                                            <div>
                                                <p className="text-sm
                                                font-medium text-foreground">
                                                    {student.name}
                                                </p>
                                                {student.isAiGenerated && (
                                                    <span className="text-xs
                                                    text-purple-500 flex
                                                    items-center gap-1">
                                                        <Sparkles className="h-3 w-3" />
                                                        AI generated
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 flex
                                        items-start gap-2">
                                            <textarea
                                                value={student.remark}
                                                onChange={(e) => handleRemarkChange(
                                                    student._id, e.target.value
                                                )}
                                                placeholder="Write a remark..."
                                                rows={2}
                                                className="flex-1 text-sm
                                                px-3 py-2 rounded-lg border
                                                border-border bg-background
                                                text-foreground focus:outline-none
                                                focus:ring-1 focus:ring-[#0E9EAD]
                                                resize-none"
                                            />
                                            <button
                                                onClick={() => generateAIRemark(student)}
                                                disabled={generatingAI === student._id}
                                                title="Generate AI Remark"
                                                className="p-2 rounded-lg
                                                bg-purple-100 dark:bg-purple-900/30
                                                text-purple-500 hover:bg-purple-200
                                                transition-colors disabled:opacity-50
                                                shrink-0"
                                            >
                                                <Sparkles className={`h-4 w-4 ${
                                                    generatingAI === student._id
                                                        ? 'animate-spin'
                                                        : ''
                                                }`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Submit Footer */}
                    {students.length > 0 && (
                        <div className="px-5 py-4 border-t border-border
                        flex items-center justify-between bg-accent/20">
                            <p className="text-sm text-muted-foreground">
                                {students.filter(s => s.remark?.trim()).length} of {students.length} remarks filled
                            </p>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="px-6 py-2 bg-[#0E9EAD]
                                text-white rounded-lg text-sm font-medium
                                hover:bg-[#0C8A98] transition-colors
                                disabled:opacity-50"
                            >
                                {submitting ? 'Saving...' : 'Save Remarks'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}