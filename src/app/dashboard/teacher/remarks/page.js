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
    const [fetched, setFetched] = useState(false)

    // per student: which ones have the add form open
    const [addingFor, setAddingFor] = useState({}) // { studentId: true }
    const [newRemark, setNewRemark] = useState({}) // { studentId: text }
    const [savingFor, setSavingFor] = useState({}) // { studentId: true }
    const [generatingFor, setGeneratingFor] = useState({}) // { studentId: true }

    // inline edit state
    const [editingRemark, setEditingRemark] = useState(null) // { remarkId, studentId, content }
    const [editSaving, setEditSaving] = useState(false)

    useEffect(() => { fetchAssignments() }, [])

    const fetchAssignments = async () => {
        try {
            const data = await api.get('/api/teacher/dashboard')
            setAssignments(data.teacher?.assignments || [])
        } catch {
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
        } catch {
            toast.error('Failed to load students')
        } finally {
            setLoading(false)
        }
    }

    const toggleAddForm = (studentId) => {
        setAddingFor(prev => ({ ...prev, [studentId]: !prev[studentId] }))
        setNewRemark(prev => ({ ...prev, [studentId]: '' }))
    }

    const handleNewRemarkChange = (studentId, value) => {
        setNewRemark(prev => ({ ...prev, [studentId]: value }))
    }

    const handleAddRemark = async (student) => {
        const content = newRemark[student._id]?.trim()
        if (!content) { toast.error('Please write a remark'); return }

        setSavingFor(prev => ({ ...prev, [student._id]: true }))
        try {
            const data = await api.post('/api/teacher/remarks', {
                cls: selectedClass,
                section: selectedSection,
                subjectName: selectedSubject,
                studentId: student._id,
                content,
                isAiGenerated: false,
            })
            // add to local state
            setStudents(prev => prev.map(s =>
                s._id === student._id
                    ? { ...s, remarks: [data.remark, ...s.remarks] }
                    : s
            ))
            setNewRemark(prev => ({ ...prev, [student._id]: '' }))
            setAddingFor(prev => ({ ...prev, [student._id]: false }))
            toast.success('Remark added!')
        } catch {
            toast.error('Failed to add remark')
        } finally {
            setSavingFor(prev => ({ ...prev, [student._id]: false }))
        }
    }

    const generateAIRemark = async (student) => {
        setGeneratingFor(prev => ({ ...prev, [student._id]: true }))
        // open add form if not open
        setAddingFor(prev => ({ ...prev, [student._id]: true }))
        try {
            const res = await fetch('/api/teacher/generate-remark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentName: student.name,
                    subjectName: selectedSubject,
                    class: selectedClass,
                })
            })
            const data = await res.json()
            if (!data.remark) {
                toast.error('Failed to generate remark')
                return
            }
            setNewRemark(prev => ({ ...prev, [student._id]: data.remark }))
            toast.success('AI remark generated!')
        } catch {
            toast.error('Failed to generate remark')
        } finally {
            setGeneratingFor(prev => ({ ...prev, [student._id]: false }))
        }
    }

    const startEditRemark = (remark, studentId) => {
        setEditingRemark({ remarkId: remark._id, studentId, content: remark.content })
    }

    const handleEditSave = async () => {
        if (!editingRemark.content?.trim()) {
            toast.error('Remark cannot be empty')
            return
        }
        setEditSaving(true)
        try {
            await api.put('/api/teacher/remarks', {
                remarkId: editingRemark.remarkId,
                content: editingRemark.content.trim(),
            })
            setStudents(prev => prev.map(s =>
                s._id === editingRemark.studentId
                    ? {
                        ...s,
                        remarks: s.remarks.map(r =>
                            r._id === editingRemark.remarkId
                                ? { ...r, content: editingRemark.content.trim(), isAiGenerated: false }
                                : r
                        )
                    }
                    : s
            ))
            toast.success('Remark updated!')
            setEditingRemark(null)
        } catch {
            toast.error('Failed to update remark')
        } finally {
            setEditSaving(false)
        }
    }

    const handleDeleteRemark = (remarkId, studentId) => {
        toast('Delete this remark?', {
            action: {
                label: 'Delete',
                onClick: async () => {
                    try {
                        await api.delete(`/api/teacher/remarks?remarkId=${remarkId}`)
                        setStudents(prev => prev.map(s =>
                            s._id === studentId
                                ? { ...s, remarks: s.remarks.filter(r => r._id !== remarkId) }
                                : s
                        ))
                        toast.success('Remark deleted')
                    } catch {
                        toast.error('Failed to delete remark')
                    }
                }
            },
            cancel: { label: 'Cancel', onClick: () => {} }
        })
    }

    const uniqueClasses = [...new Set(assignments.map(a => a.class))]
    const sectionsForClass = assignments
        .filter(a => a.class === selectedClass).map(a => a.section)
    const subjectsForClass = assignments
        .filter(a => a.class === selectedClass && a.section === selectedSection)
        .map(a => a.subjectName)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Remarks</h1>
                <p className="text-muted-foreground mt-1">
                    Add and manage remarks for your students
                </p>
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap items-end gap-4 p-4
            bg-card border border-border rounded-xl">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Class</label>
                    <select
                        value={selectedClass}
                        onChange={e => {
                            setSelectedClass(e.target.value)
                            setSelectedSection('')
                            setSelectedSubject('')
                            setFetched(false)
                            setStudents([])
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
                        onChange={e => {
                            setSelectedSection(e.target.value)
                            setSelectedSubject('')
                            setFetched(false)
                            setStudents([])
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
                        onChange={e => {
                            setSelectedSubject(e.target.value)
                            setFetched(false)
                            setStudents([])
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
                    onClick={fetchRemarks}
                    disabled={loading}
                    className="px-5 py-2 bg-[#0E9EAD] text-white
                    rounded-lg text-sm font-medium hover:bg-[#0C8A98]
                    transition-colors disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Load'}
                </button>
            </div>

            {/* Students */}
            {fetched && (
                <div className="space-y-4">
                    {students.length === 0 ? (
                        <div className="bg-card border border-border
                        rounded-xl px-5 py-10 text-center">
                            <p className="text-sm text-muted-foreground">
                                No students found.
                            </p>
                        </div>
                    ) : students.map((student, i) => (
                        <div key={student._id}
                            className="bg-card border border-border
                            rounded-xl overflow-hidden">

                            {/* Student header */}
                            <div className="flex items-center justify-between
                            px-5 py-4 border-b border-border">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-muted-foreground w-5">
                                        {i + 1}
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            {student.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {student.remarks.length} remark{student.remarks.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => generateAIRemark(student)}
                                        disabled={!!generatingFor[student._id]}
                                        title="Generate AI Remark"
                                        className="p-2 rounded-lg bg-purple-100
                                        dark:bg-purple-900/30 text-purple-500
                                        hover:bg-purple-200 transition-colors
                                        disabled:opacity-50"
                                    >
                                        <Sparkles className={`h-4 w-4 ${
                                            generatingFor[student._id] ? 'animate-spin' : ''
                                        }`} />
                                    </button>
                                    <button
                                        onClick={() => toggleAddForm(student._id)}
                                        className="text-xs px-3 py-1.5 rounded-lg
                                        bg-[#0E9EAD] text-white hover:bg-[#0C8A98]
                                        transition-colors"
                                    >
                                        {addingFor[student._id] ? 'Cancel' : '+ Add'}
                                    </button>
                                </div>
                            </div>

                            {/* Add remark form */}
                            {addingFor[student._id] && (
                                <div className="px-5 py-4 border-b border-border
                                bg-accent/10">
                                    <textarea
                                        value={newRemark[student._id] || ''}
                                        onChange={e => handleNewRemarkChange(
                                            student._id, e.target.value
                                        )}
                                        placeholder="Write a remark..."
                                        rows={3}
                                        className="w-full text-sm px-3 py-2
                                        rounded-lg border border-border
                                        bg-background text-foreground
                                        focus:outline-none focus:ring-1
                                        focus:ring-[#0E9EAD] resize-none"
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button
                                            onClick={() => toggleAddForm(student._id)}
                                            className="px-4 py-1.5 bg-accent
                                            text-foreground rounded-lg text-sm
                                            hover:bg-accent/80 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleAddRemark(student)}
                                            disabled={!!savingFor[student._id]}
                                            className="px-4 py-1.5 bg-[#0E9EAD]
                                            text-white rounded-lg text-sm font-medium
                                            hover:bg-[#0C8A98] transition-colors
                                            disabled:opacity-50"
                                        >
                                            {savingFor[student._id] ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Remarks list */}
                            {student.remarks.length === 0 ? (
                                <div className="px-5 py-6 text-center">
                                    <p className="text-xs text-muted-foreground">
                                        No remarks yet. Click "+ Add" to write one.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {student.remarks.map(remark => (
                                        <div key={remark._id} className="px-5 py-4">
                                            {editingRemark?.remarkId === remark._id ? (
                                                // inline edit
                                                <div>
                                                    <textarea
                                                        value={editingRemark.content}
                                                        onChange={e => setEditingRemark(prev => ({
                                                            ...prev,
                                                            content: e.target.value
                                                        }))}
                                                        rows={3}
                                                        className="w-full text-sm px-3 py-2
                                                        rounded-lg border border-border
                                                        bg-background text-foreground
                                                        focus:outline-none focus:ring-1
                                                        focus:ring-[#0E9EAD] resize-none"
                                                    />
                                                    <div className="flex justify-end gap-2 mt-2">
                                                        <button
                                                            onClick={() => setEditingRemark(null)}
                                                            className="px-4 py-1.5 bg-accent
                                                            text-foreground rounded-lg text-sm
                                                            hover:bg-accent/80 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={handleEditSave}
                                                            disabled={editSaving}
                                                            className="px-4 py-1.5 bg-[#0E9EAD]
                                                            text-white rounded-lg text-sm
                                                            font-medium hover:bg-[#0C8A98]
                                                            transition-colors disabled:opacity-50"
                                                        >
                                                            {editSaving ? 'Saving...' : 'Update'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                // read view
                                                <div className="flex items-start
                                                justify-between gap-4">
                                                    <div className="flex-1">
                                                        <p className="text-sm text-foreground
                                                        leading-relaxed">
                                                            {remark.content}
                                                        </p>
                                                        <div className="flex items-center
                                                        gap-2 mt-1.5">
                                                            <span className="text-xs
                                                            text-muted-foreground">
                                                                {new Date(remark.createdAt)
                                                                    .toLocaleDateString('en-IN', {
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                        year: 'numeric'
                                                                    })}
                                                            </span>
                                                            {remark.isAiGenerated && (
                                                                <span className="text-xs
                                                                text-purple-500 flex
                                                                items-center gap-1">
                                                                    <Sparkles className="h-3 w-3" />
                                                                    AI
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <button
                                                            onClick={() => startEditRemark(remark, student._id)}
                                                            className="text-xs px-2.5 py-1
                                                            rounded-md bg-accent text-foreground
                                                            hover:bg-accent/80 transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRemark(
                                                                remark._id, student._id
                                                            )}
                                                            className="text-xs px-2.5 py-1
                                                            rounded-md bg-red-100
                                                            dark:bg-red-900/30 text-red-500
                                                            hover:bg-red-200 transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}