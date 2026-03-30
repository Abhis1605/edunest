'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export default function ParentMarksPage() {
    const [subjects, setSubjects] = useState([])
    const [studentName, setStudentName] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMarks()
    }, [])

    const fetchMarks = async () => {
        try {
            const data = await api.get('/api/parent/marks')
            setSubjects(data.subjects || [])
            setStudentName(data.studentName || '')
        } catch (error) {
            toast.error('Failed to load marks')
        } finally {
            setLoading(false)
        }
    }

    const getGrade = (percentage) => {
        if (percentage >= 90) return { grade: 'A+', color: 'text-green-500' }
        if (percentage >= 80) return { grade: 'A', color: 'text-green-500' }
        if (percentage >= 70) return { grade: 'B', color: 'text-[#0E9EAD]' }
        if (percentage >= 60) return { grade: 'C', color: 'text-yellow-500' }
        if (percentage >= 40) return { grade: 'D', color: 'text-orange-500' }
        return { grade: 'F', color: 'text-red-500' }
    }

    const getBarColor = (percentage) => {
        if (percentage >= 70) return 'bg-green-500'
        if (percentage >= 40) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Marks
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Loading marks...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">
                    Marks
                </h1>
                <p className="text-muted-foreground mt-1">
                    {studentName
                        ? `${studentName}'s marks`
                        : "Your child's marks"}
                </p>
            </div>

            {subjects.length === 0 ? (
                <div className="bg-card border border-border
                rounded-xl px-5 py-12 text-center">
                    <p className="text-muted-foreground text-sm">
                        No marks added yet.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {subjects.map((subject, i) => {
                        const { grade, color } = getGrade(subject.percentage)
                        return (
                            <div key={i} className="bg-card border
                            border-border rounded-xl overflow-hidden">

                                {/* Subject Header */}
                                <div className="flex items-center
                                justify-between px-5 py-4
                                border-b border-border">
                                    <div>
                                        <h2 className="font-semibold
                                        text-foreground">
                                            {subject.subject}
                                        </h2>
                                        <p className="text-xs
                                        text-muted-foreground mt-0.5">
                                            {subject.exams.length} exam{subject.exams.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="hidden md:block">
                                            <div className="w-32 h-2
                                            bg-accent rounded-full
                                            overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full
                                                    transition-all ${getBarColor(subject.percentage)}`}
                                                    style={{ width: `${subject.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xl font-bold ${color}`}>
                                                {grade}
                                            </p>
                                            <p className="text-xs
                                            text-muted-foreground">
                                                {subject.percentage}%
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm
                                            font-semibold text-foreground">
                                                {subject.totalMarks}/{subject.totalMax}
                                            </p>
                                            <p className="text-xs
                                            text-muted-foreground">
                                                Total
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Exam Rows */}
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border bg-accent/30">
                                            <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2">Exam</th>
                                            <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2">Marks</th>
                                            <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2">Percentage</th>
                                            <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subject.exams.map((exam, j) => {
                                            const examPct = ((exam.marks / exam.maxMarks) * 100).toFixed(1)
                                            const examGrade = getGrade(examPct)
                                            return (
                                                <tr key={j}
                                                    className="border-b border-border last:border-0 hover:bg-accent/20 transition-colors">
                                                    <td className="px-5 py-3 text-sm text-foreground">
                                                        {exam.examTitle}
                                                    </td>
                                                    <td className="px-5 py-3 text-sm text-right font-medium text-foreground">
                                                        {exam.marks}/{exam.maxMarks}
                                                    </td>
                                                    <td className="px-5 py-3 text-sm text-right text-muted-foreground">
                                                        {examPct}%
                                                    </td>
                                                    <td className="px-5 py-3 text-right">
                                                        <span className={`text-sm font-bold ${examGrade.color}`}>
                                                            {examGrade.grade}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}