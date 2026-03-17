'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export default function AttendancePage() {
    const [assignments, setAssignments] = useState([])
    const [selectedClass, setSelectedClass] = useState('')
    const [selectedSection, setSelectedSection] = useState('')
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split('T')[0]
    )
    const [students, setStudents] = useState([])
    const [alreadyTaken, setAlreadyTaken] = useState(false)
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [fetched, setFetched] = useState(false)

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

    const fetchAttendance = async () => {
        if (!selectedClass || !selectedSection) {
            toast.error('Please select class and section')
            return
        }

        const today = new Date().toISOString().split('T')[0]
        if (selectedDate > today) {
            toast.error('Cannot take attendance for future')
            return
        }
        setLoading(true)
        setFetched(false)
        try {
            const data = await api.get(
                `/api/teacher/attendance?class=${selectedClass}&section=${selectedSection}&date=${selectedDate}`
            )
            setStudents(data.students || [])
            setAlreadyTaken(data.alreadyTaken || false)
            setFetched(true)
        } catch (error) {
            toast.error('Failed to load students')
        } finally {
            setLoading(false)
        }
    }

    const setStatus = (studentId, status) => {
        if (alreadyTaken) return
        setStudents(students.map(s =>
            s._id === studentId ? { ...s, status } : s
        ))
    }

    const markAll = (status) => {
        setStudents(students.map(s => ({ ...s, status })))
    }

    const handleSubmit = async () => {
        if (students.length === 0) return
        setSubmitting(true)
        try {
            await api.post('/api/teacher/attendance', {
                cls: selectedClass,
                section: selectedSection,
                date: selectedDate,
                attendance: students.map(s => ({
                    studentId: s._id,
                    status: s.status
                }))
            })
            toast.success('Attendance saved!')
            setAlreadyTaken(true)
        } catch (error) {
            toast.error('Failed to save attendance')
        } finally {
            setSubmitting(false)
        }
    }

    const presentCount = students.filter(s => s.status === 'present').length
    const absentCount = students.filter(s => s.status === 'absent').length

    const uniqueClasses = [...new Set(assignments.map(a => a.class))]
    const sectionsForClass = assignments
        .filter(a => a.class === selectedClass)
        .map(a => a.section)

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">
                    Attendance
                </h1>
                <p className="text-muted-foreground mt-1">
                    Take attendance for your class
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
                        Date
                    </label>
                    <input
                        type="date"
                        value={selectedDate}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                            setSelectedDate(e.target.value)
                            setFetched(false)
                            setStudents([])
                        }}
                        className="text-sm px-3 py-2 rounded-lg
                        border border-border bg-background
                        text-foreground focus:outline-none
                        focus:ring-1 focus:ring-[#0E9EAD]"
                    />
                </div>

                <button
                    onClick={fetchAttendance}
                    disabled={loading}
                    className="px-5 py-2 bg-[#0E9EAD] text-white
                    rounded-lg text-sm font-medium
                    hover:bg-[#0C8A98] transition-colors
                    disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Load'}
                </button>
            </div>

            {/* Attendance Register */}
            {fetched && (
                <div className="bg-card border border-border rounded-xl overflow-hidden">

                    {/* Register Header */}
                    <div className="flex items-center justify-between
                    px-5 py-4 border-b border-border">
                        <div>
                            <h2 className="font-semibold text-foreground">
                                Class {selectedClass} — Section {selectedSection}
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(selectedDate).toLocaleDateString('en-IN', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Stats */}
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">
                                    Present
                                </p>
                                <p className="text-lg font-bold
                                text-green-500">
                                    {presentCount}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">
                                    Absent
                                </p>
                                <p className="text-lg font-bold
                                text-red-500">
                                    {absentCount}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">
                                    Total
                                </p>
                                <p className="text-lg font-bold
                                text-foreground">
                                    {students.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Already taken banner */}
                    {alreadyTaken && (
                        <div className="px-5 py-3 bg-green-50
                        dark:bg-green-900/20 border-b border-green-200
                        dark:border-green-900">
                            <p className="text-sm text-green-600
                            dark:text-green-400 font-medium">
                                ✓ Attendance already submitted for this date
                            </p>
                        </div>
                    )}

                    {/* Mark All Row */}
                    {!alreadyTaken && students.length > 0 && (
                        <div className="flex items-center gap-3
                        px-5 py-3 bg-accent/50 border-b border-border">
                            <span className="text-xs text-muted-foreground
                            font-medium">
                                Mark All:
                            </span>
                            <button
                                onClick={() => markAll('present')}
                                className="text-xs px-3 py-1 rounded-md
                                bg-green-100 dark:bg-green-900/30
                                text-green-600 hover:bg-green-200
                                transition-colors font-medium"
                            >
                                All Present
                            </button>
                            <button
                                onClick={() => markAll('absent')}
                                className="text-xs px-3 py-1 rounded-md
                                bg-red-100 dark:bg-red-900/30
                                text-red-500 hover:bg-red-200
                                transition-colors font-medium"
                            >
                                All Absent
                            </button>
                        </div>
                    )}

                    {/* Table */}
                    {students.length === 0 ? (
                        <div className="px-5 py-8 text-center">
                            <p className="text-sm text-muted-foreground">
                                No students found in this class.
                            </p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border
                                bg-accent/30">
                                    <th className="text-left text-xs
                                    font-medium text-muted-foreground
                                    px-5 py-3 w-12">
                                        #
                                    </th>
                                    <th className="text-left text-xs
                                    font-medium text-muted-foreground
                                    px-5 py-3">
                                        Student Name
                                    </th>
                                    <th className="text-right text-xs
                                    font-medium text-muted-foreground
                                    px-5 py-3 w-40">
                                        Attendance
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, i) => (
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
                                                <button
                                                    onClick={() => setStatus(
                                                        student._id, 'present'
                                                    )}
                                                    disabled={alreadyTaken}
                                                    className={`px-3 py-1 rounded-md
                                                    text-xs font-semibold
                                                    transition-colors
                                                    disabled:cursor-default ${
                                                        student.status === 'present'
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-green-100 hover:text-green-600'
                                                    }`}
                                                >
                                                    P
                                                </button>
                                                <button
                                                    onClick={() => setStatus(
                                                        student._id, 'absent'
                                                    )}
                                                    disabled={alreadyTaken}
                                                    className={`px-3 py-1 rounded-md
                                                    text-xs font-semibold
                                                    transition-colors
                                                    disabled:cursor-default ${
                                                        student.status === 'absent'
                                                            ? 'bg-red-500 text-white'
                                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-red-100 hover:text-red-500'
                                                    }`}
                                                >
                                                    A
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Submit Footer */}
                    {!alreadyTaken && students.length > 0 && (
                        <div className="px-5 py-4 border-t border-border
                        flex items-center justify-between bg-accent/20">
                            <p className="text-sm text-muted-foreground">
                                {presentCount} present · {absentCount} absent
                                · {students.length} total
                            </p>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="px-6 py-2 bg-[#0E9EAD]
                                text-white rounded-lg text-sm font-medium
                                hover:bg-[#0C8A98] transition-colors
                                disabled:opacity-50"
                            >
                                {submitting ? 'Saving...' : 'Submit Attendance'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}