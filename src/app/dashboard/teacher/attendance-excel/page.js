'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Download } from 'lucide-react'

export default function AttendanceExcelPage() {
    const [assignments, setAssignments] = useState([])
    const [selectedClass, setSelectedClass] = useState('')
    const [selectedSection, setSelectedSection] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [downloading, setDownloading] = useState(false)

    useEffect(() => {
        fetchAssignments()
        // Set default date range — current month
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const today = new Date()
        setStartDate(firstDay.toISOString().split('T')[0])
        setEndDate(today.toISOString().split('T')[0])
    }, [])

    const fetchAssignments = async () => {
        try {
            const data = await api.get('/api/teacher/dashboard')
            setAssignments(data.teacher?.assignments || [])
        } catch (error) {
            toast.error('Failed to load assignments')
        }
    }

    const handleDownload = async () => {
        if (!selectedClass || !selectedSection) {
            toast.error('Please select class and section')
            return
        }
        if (!startDate || !endDate) {
            toast.error('Please select date range')
            return
        }
        if (startDate > endDate) {
            toast.error('Start date cannot be after end date')
            return
        }

        setDownloading(true)
        try {
            const url = `/api/teacher/attendance-excel?class=${selectedClass}&section=${selectedSection}&startDate=${startDate}&endDate=${endDate}`

            const response = await fetch(url)

            if (!response.ok) {
                toast.error('Failed to download Excel')
                return
            }

            // Download file
            const blob = await response.blob()
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `Attendance_Class${selectedClass}${selectedSection}_${startDate}_to_${endDate}.xlsx`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(link.href)

            toast.success('Excel downloaded successfully!')
        } catch (error) {
            toast.error('Failed to download')
        } finally {
            setDownloading(false)
        }
    }

    const uniqueClasses = [...new Set(assignments.map(a => a.class))]
    const sectionsForClass = assignments
        .filter(a => a.class === selectedClass)
        .map(a => a.section)

    const today = new Date().toISOString().split('T')[0]

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">
                    Attendance Excel
                </h1>
                <p className="text-muted-foreground mt-1">
                    Download attendance report as Excel file
                </p>
            </div>

            {/* Download Card */}
            <div className="bg-card border border-border
            rounded-xl p-6 space-y-6">

                <h2 className="font-semibold text-foreground">
                    Select Details
                </h2>

                {/* Filters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">
                            Class *
                        </label>
                        <select
                            value={selectedClass}
                            onChange={(e) => {
                                setSelectedClass(e.target.value)
                                setSelectedSection('')
                            }}
                            className="text-sm px-3 py-2 rounded-lg
                            border border-border bg-background
                            text-foreground focus:outline-none
                            focus:ring-1 focus:ring-[#0E9EAD]"
                        >
                            <option value="">Select Class</option>
                            {uniqueClasses.map(c => (
                                <option key={c} value={c}>Class {c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">
                            Section *
                        </label>
                        <select
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                            disabled={!selectedClass}
                            className="text-sm px-3 py-2 rounded-lg
                            border border-border bg-background
                            text-foreground focus:outline-none
                            focus:ring-1 focus:ring-[#0E9EAD]
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
                            Start Date *
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            max={today}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="text-sm px-3 py-2 rounded-lg
                            border border-border bg-background
                            text-foreground focus:outline-none
                            focus:ring-1 focus:ring-[#0E9EAD]"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">
                            End Date *
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            max={today}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="text-sm px-3 py-2 rounded-lg
                            border border-border bg-background
                            text-foreground focus:outline-none
                            focus:ring-1 focus:ring-[#0E9EAD]"
                        />
                    </div>
                </div>

                {/* Preview Info */}
                {selectedClass && selectedSection && startDate && endDate && (
                    <div className="flex items-center gap-3 p-4
                    bg-[#0E9EAD]/10 rounded-xl border
                    border-[#0E9EAD]/20">
                        <div>
                            <p className="text-sm font-medium
                            text-foreground">
                                Class {selectedClass} — Section {selectedSection}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(startDate).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })} to {new Date(endDate).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                )}

                {/* What Excel Contains */}
                <div className="bg-accent/50 rounded-xl p-4">
                    <p className="text-sm font-medium text-foreground mb-2">
                        Excel file will contain:
                    </p>
                    <ul className="space-y-1">
                        {[
                            'Student names with Sr No',
                            'Date wise attendance — P (Present) / A (Absent)',
                            'Total present and absent days',
                            'Attendance percentage',
                            'Color coded — Green for Present, Red for Absent',
                        ].map((item, i) => (
                            <li key={i} className="text-xs
                            text-muted-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full
                                bg-[#0E9EAD] shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Download Button */}
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex items-center gap-2 px-6 py-3
                    bg-[#0E9EAD] text-white rounded-xl text-sm
                    font-medium hover:bg-[#0C8A98] transition-colors
                    disabled:opacity-50"
                >
                    <Download className="h-4 w-4" />
                    {downloading ? 'Downloading...' : 'Download Excel'}
                </button>
            </div>
        </div>
    )
}