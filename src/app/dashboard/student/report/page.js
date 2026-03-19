'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Printer } from 'lucide-react'
import Image from 'next/image'

export default function StudentReportPage() {
    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReport()
    }, [])

    const fetchReport = async () => {
        try {
            const data = await api.get('/api/student/report')
            setReport(data)
        } catch (error) {
            toast.error('Failed to load report')
        } finally {
            setLoading(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    const examTypeLabel = {
        unit1: 'Unit Test 1',
        unit2: 'Unit Test 2',
        midterm: 'Mid Term',
        final: 'Final Exam',
    }

    const getGrade = (percentage) => {
        if (percentage >= 90) return 'A+'
        if (percentage >= 80) return 'A'
        if (percentage >= 70) return 'B+'
        if (percentage >= 60) return 'B'
        if (percentage >= 50) return 'C'
        if (percentage >= 40) return 'D'
        return 'F'
    }

    const getGradeColor = (percentage) => {
        if (percentage >= 70) return 'bg-green-100 text-green-700'
        if (percentage >= 40) return 'bg-yellow-100 text-yellow-700'
        return 'bg-red-100 text-red-600'
    }

    const getPercentColor = (percentage) => {
        if (percentage >= 70) return 'text-green-600'
        if (percentage >= 40) return 'text-yellow-600'
        return 'text-red-500'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <p className="text-muted-foreground text-sm">
                    Loading report...
                </p>
            </div>
        )
    }

    if (!report) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <p className="text-muted-foreground text-sm">
                    Failed to load report.
                </p>
            </div>
        )
    }

    return (
        <div>
            {/* Print Button */}
            <div className="flex justify-end mb-4 print:hidden">
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-5 py-2
                    bg-[#0E9EAD] text-white rounded-lg text-sm
                    font-medium hover:bg-[#0C8A98] transition-colors"
                >
                    <Printer className="h-4 w-4" />
                    Print / Download PDF
                </button>
            </div>

            {/* Report Card */}
            <div className="max-w-3xl mx-auto bg-white text-gray-800
            shadow-lg rounded-xl overflow-hidden print:shadow-none
            print:max-w-none print:rounded-none">

                {/* Header */}
                <div style={{ backgroundColor: '#0E9EAD' }}
                    className="px-8 py-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white rounded-lg p-1">
                                <Image
                                    src="/Images/logo.png"
                                    alt="EduNest"
                                    width={45}
                                    height={45}
                                />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">
                                    EduNest
                                </h1>
                                <p className="text-xs"
                                    style={{ color: 'rgba(255,255,255,0.8)' }}>
                                    Student Management Portal
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold">
                                Progress Report
                            </p>
                            <p className="text-xs"
                                style={{ color: 'rgba(255,255,255,0.8)' }}>
                                Academic Year 2025-26
                            </p>
                            <p className="text-xs mt-1"
                                style={{ color: 'rgba(255,255,255,0.8)' }}>
                                Generated: {report.generatedAt}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Student Info */}
                <div className="px-8 py-5 border-b border-gray-200
                bg-gray-50 avoid-break">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <span className="text-xs text-gray-500 w-28 shrink-0">
                                    Student Name
                                </span>
                                <span className="text-xs font-semibold text-gray-800">
                                    : {report.student?.name}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-xs text-gray-500 w-28 shrink-0">
                                    Class
                                </span>
                                <span className="text-xs font-semibold text-gray-800">
                                    : {report.student?.class} — Section {report.student?.section}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-xs text-gray-500 w-28 shrink-0">
                                    Parent Name
                                </span>
                                <span className="text-xs font-semibold text-gray-800">
                                    : {report.student?.parentName || 'N/A'}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <span className="text-xs text-gray-500 w-28 shrink-0">
                                    Attendance
                                </span>
                                <span className="text-xs font-semibold text-gray-800">
                                    : {report.attendance?.attendancePercent}%
                                    ({report.attendance?.presentDays}/{report.attendance?.totalDays} days)
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-xs text-gray-500 w-28 shrink-0">
                                    Present Days
                                </span>
                                <span className="text-xs font-semibold text-green-600">
                                    : {report.attendance?.presentDays}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-xs text-gray-500 w-28 shrink-0">
                                    Absent Days
                                </span>
                                <span className="text-xs font-semibold text-red-500">
                                    : {report.attendance?.absentDays}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attendance Section */}
                <div className="px-8 py-5 border-b border-gray-200 avoid-break">
                    <h2 className="text-xs font-bold text-gray-700
                    uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-1 h-4 rounded-full inline-block"
                            style={{ backgroundColor: '#0E9EAD' }} />
                        Attendance Report
                    </h2>

                    {Object.entries(report.attendance?.monthly || {}).map(
                        ([month, records]) => {
                            const present = records.filter(r => r.status === 'P').length
                            const total = records.length
                            const pct = total > 0
                                ? ((present / total) * 100).toFixed(1)
                                : 0

                            return (
                                <div key={month} className="mb-4">
                                    <div className="flex items-center
                                    justify-between mb-2">
                                        <p className="text-xs font-semibold
                                        text-gray-600">
                                            {month}
                                        </p>
                                        <p className={`text-xs font-bold ${
                                            pct >= 75
                                                ? 'text-green-600'
                                                : 'text-red-500'
                                        }`}>
                                            {present}/{total} days ({pct}%)
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {records.map((r, i) => (
                                            <div key={i}
                                                className={`w-7 h-7 rounded
                                                flex items-center justify-center
                                                text-xs font-bold ${
                                                    r.status === 'P'
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-red-100 text-red-500'
                                                }`}>
                                                {r.status}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        }
                    )}
                </div>

                {/* Marks Section */}
                <div className="px-8 py-5 border-b border-gray-200 avoid-break">
                    <h2 className="text-xs font-bold text-gray-700
                    uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-1 h-4 rounded-full inline-block"
                            style={{ backgroundColor: '#0E9EAD' }} />
                        Academic Performance
                    </h2>

                    {report.subjects?.length === 0 ? (
                        <p className="text-xs text-gray-500">
                            No marks recorded yet.
                        </p>
                    ) : (
                        <>
                            <table className="w-full text-xs border
                            border-gray-200 rounded-lg overflow-hidden">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="text-left px-3 py-2
                                        text-gray-600 font-semibold border-b
                                        border-gray-200">
                                            Subject
                                        </th>
                                        <th className="text-left px-3 py-2
                                        text-gray-600 font-semibold border-b
                                        border-gray-200">
                                            Exam
                                        </th>
                                        <th className="text-center px-3 py-2
                                        text-gray-600 font-semibold border-b
                                        border-gray-200">
                                            Marks
                                        </th>
                                        <th className="text-center px-3 py-2
                                        text-gray-600 font-semibold border-b
                                        border-gray-200">
                                            Max
                                        </th>
                                        <th className="text-center px-3 py-2
                                        text-gray-600 font-semibold border-b
                                        border-gray-200">
                                            %
                                        </th>
                                        <th className="text-center px-3 py-2
                                        text-gray-600 font-semibold border-b
                                        border-gray-200">
                                            Grade
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.subjects?.map((subject, i) =>
                                        subject.exams.map((exam, j) => {
                                            const pct = ((exam.marks / exam.maxMarks) * 100).toFixed(1)
                                            const grade = getGrade(pct)
                                            return (
                                                <tr key={`${i}-${j}`}
                                                    className={`border-b border-gray-100 ${
                                                        i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                    }`}>
                                                    <td className="px-3 py-2 font-medium text-gray-700">
                                                        {j === 0 ? subject.subject : ''}
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-600">
                                                        {examTypeLabel[exam.examType]}
                                                    </td>
                                                    <td className="px-3 py-2 text-center font-semibold text-gray-800">
                                                        {exam.marks}
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-gray-500">
                                                        {exam.maxMarks}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className={`font-semibold ${getPercentColor(pct)}`}>
                                                            {pct}%
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${getGradeColor(pct)}`}>
                                                            {grade}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>

                            {/* Grade Scale */}
                            <div className="mt-3 flex flex-wrap gap-2">
                                {[
                                    { range: '90-100', grade: 'A+', color: 'bg-green-100 text-green-700' },
                                    { range: '80-89', grade: 'A', color: 'bg-green-100 text-green-700' },
                                    { range: '70-79', grade: 'B+', color: 'bg-blue-100 text-blue-700' },
                                    { range: '60-69', grade: 'B', color: 'bg-blue-100 text-blue-700' },
                                    { range: '50-59', grade: 'C', color: 'bg-yellow-100 text-yellow-700' },
                                    { range: '40-49', grade: 'D', color: 'bg-orange-100 text-orange-700' },
                                    { range: '0-39', grade: 'F', color: 'bg-red-100 text-red-600' },
                                ].map((g, i) => (
                                    <span key={i} className={`text-xs px-2 py-0.5 rounded font-medium ${g.color}`}>
                                        {g.grade}: {g.range}%
                                    </span>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Remarks */}
                {report.remarks?.length > 0 && (
                    <div className="px-8 py-5 border-b border-gray-200 avoid-break">
                        <h2 className="text-xs font-bold text-gray-700
                        uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-1 h-4 rounded-full inline-block"
                                style={{ backgroundColor: '#0E9EAD' }} />
                            Teacher Remarks
                        </h2>
                        <div className="space-y-2">
                            {report.remarks.map((remark, i) => (
                                <div key={i}
                                    className="flex gap-3 p-3 bg-gray-50
                                    rounded-lg border border-gray-100">
                                    <span className="text-xs font-semibold w-20 shrink-0"
                                        style={{ color: '#0E9EAD' }}>
                                        {remark.subjectName}
                                    </span>
                                    <p className="text-xs text-gray-700">
                                        {remark.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Signatures */}
                <div className="px-8 py-6 avoid-break">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="border-t border-gray-400 pt-2 mt-10">
                                <p className="text-xs text-gray-500">
                                    Student Signature
                                </p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="border-t border-gray-400 pt-2 mt-10">
                                <p className="text-xs text-gray-500">
                                    Class Teacher
                                </p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="border-t border-gray-400 pt-2 mt-10">
                                <p className="text-xs text-gray-500">
                                    Parent Signature
                                </p>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-6">
                        This is a computer generated report from EduNest Portal
                    </p>
                </div>
            </div>
        </div>
    )
}