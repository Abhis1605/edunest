'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

const AllStudentsDownloadButton = dynamic(
    () => import('@/components/shared/TeacherReportButtons')
        .then(m => m.AllStudentsDownloadButton),
    { ssr: false, loading: () => null }
)

const SingleStudentDownloadButton = dynamic(
    () => import('@/components/shared/TeacherReportButtons')
        .then(m => m.SingleStudentDownloadButton),
    { ssr: false, loading: () => null }
)

export default function TeacherReportsPage() {
    const [assignments, setAssignments] = useState([])
    const [selectedClass, setSelectedClass] = useState('')
    const [selectedSection, setSelectedSection] = useState('')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(false)
    const [fetched, setFetched] = useState(false)

    useEffect(() => { fetchAssignments() }, [])

    const fetchAssignments = async () => {
        try {
            const data = await api.get('/api/teacher/dashboard')
            setAssignments(data.teacher?.assignments || [])
        } catch {
            toast.error('Failed to load assignments')
        }
    }

    const uniqueClasses = [...new Set(assignments.map(a => a.class))]
    const sectionsForClass = [...new Set(
        assignments.filter(a => a.class === selectedClass).map(a => a.section)
    )]

    const fetchReports = async () => {
        if (!selectedClass || !selectedSection || !fromDate || !toDate) {
            toast.error('Please fill all fields')
            return
        }
        if (fromDate > toDate) {
            toast.error('From date cannot be after to date')
            return
        }
        setReports([])
        setFetched(false)
        setLoading(true)
        try {
            const data = await api.get(
                `/api/teacher/reports?class=${selectedClass}&section=${selectedSection}&from=${fromDate}&to=${toDate}`
            )
            if (!data.reports || data.reports.length === 0) {
                toast.error('No students found in this class')
                return
            }
            setReports(data.reports)
            setFetched(true)
        } catch {
            toast.error('Failed to load reports')
        } finally {
            setLoading(false)
        }
    }

    const getMarkColor = (pct) => {
        const n = Number(pct)
        if (n >= 70) return 'text-green-500'
        if (n >= 40) return 'text-yellow-500'
        return 'text-red-500'
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">
                    Student Reports
                </h1>
                <p className="text-muted-foreground mt-1">
                    Generate and download reports for your students
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-end gap-4 p-4
            bg-card border border-border rounded-xl">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Class</label>
                    <select
                        value={selectedClass}
                        onChange={e => {
                            setSelectedClass(e.target.value)
                            setSelectedSection('')
                            setFetched(false)
                            setReports([])
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
                            setFetched(false)
                            setReports([])
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
                    <label className="text-xs text-muted-foreground">From Date</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={e => {
                            setFromDate(e.target.value)
                            setFetched(false)
                            setReports([])
                        }}
                        className="text-sm px-3 py-2 rounded-lg border
                        border-border bg-background text-foreground
                        focus:outline-none focus:ring-1 focus:ring-[#0E9EAD]"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">To Date</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={e => {
                            setToDate(e.target.value)
                            setFetched(false)
                            setReports([])
                        }}
                        className="text-sm px-3 py-2 rounded-lg border
                        border-border bg-background text-foreground
                        focus:outline-none focus:ring-1 focus:ring-[#0E9EAD]"
                    />
                </div>

                <button
                    onClick={fetchReports}
                    disabled={loading}
                    className="px-5 py-2 bg-[#0E9EAD] text-white
                    rounded-lg text-sm font-medium hover:bg-[#0C8A98]
                    transition-colors disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Generate'}
                </button>
            </div>

            {/* Results */}
            {fetched && reports.length > 0 && (
                <div className="space-y-4">
                    {/* Top bar */}
                    <div className="flex items-center justify-between
                    flex-wrap gap-3">
                        <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                                Class {selectedClass} — {selectedSection}
                            </span>
                            {' '}· {reports.length} students ·{' '}
                            {new Date(fromDate).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                            })}
                            {' to '}
                            {new Date(toDate).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                            })}
                        </p>
                        <AllStudentsDownloadButton
                            reports={reports}
                            cls={selectedClass}
                            section={selectedSection}
                        />
                    </div>

                    {/* Students table */}
                    <div className="bg-card border border-border
                    rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-accent/30">
                                    <th className="text-left text-xs font-medium
                                    text-muted-foreground px-5 py-3 w-10">
                                        #
                                    </th>
                                    <th className="text-left text-xs font-medium
                                    text-muted-foreground px-5 py-3">
                                        Student
                                    </th>
                                    <th className="text-center text-xs font-medium
                                    text-muted-foreground px-5 py-3 hidden sm:table-cell">
                                        Attendance
                                    </th>
                                    <th className="text-center text-xs font-medium
                                    text-muted-foreground px-5 py-3 hidden sm:table-cell">
                                        Subjects
                                    </th>
                                    <th className="text-center text-xs font-medium
                                    text-muted-foreground px-5 py-3 hidden md:table-cell">
                                        Avg %
                                    </th>
                                    <th className="text-right text-xs font-medium
                                    text-muted-foreground px-5 py-3">
                                        Report
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report, i) => {
                                    const avgPct = report.subjects.length > 0
                                        ? (report.subjects.reduce(
                                            (sum, s) => sum + Number(s.percentage), 0
                                          ) / report.subjects.length).toFixed(1)
                                        : 0

                                    return (
                                        <tr key={i}
                                            className="border-b border-border
                                            last:border-0 hover:bg-accent/20
                                            transition-colors">
                                            <td className="px-5 py-3 text-sm
                                            text-muted-foreground">
                                                {i + 1}
                                            </td>
                                            <td className="px-5 py-3">
                                                <p className="text-sm font-medium
                                                text-foreground">
                                                    {report.student?.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {report.student?.email}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3 text-center
                                            hidden sm:table-cell">
                                                <span className={`text-sm font-semibold ${
                                                    Number(report.attendance?.attendancePercent) >= 75
                                                        ? 'text-green-500'
                                                        : 'text-red-500'
                                                }`}>
                                                    {report.attendance?.attendancePercent}%
                                                </span>
                                                <p className="text-xs text-muted-foreground">
                                                    {report.attendance?.presentDays}/
                                                    {report.attendance?.totalDays} days
                                                </p>
                                            </td>
                                            <td className="px-5 py-3 text-center
                                            text-sm text-foreground hidden sm:table-cell">
                                                {report.subjects.length}
                                            </td>
                                            <td className="px-5 py-3 text-center
                                            hidden md:table-cell">
                                                <span className={`text-sm font-semibold
                                                ${getMarkColor(avgPct)}`}>
                                                    {avgPct}%
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <SingleStudentDownloadButton
                                                    report={report}
                                                />
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}