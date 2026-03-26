'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import PieChartCard from '@/components/shared/PieChartCard'

export default function StudentAttendancePage() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAttendance()
    }, [])

    const fetchAttendance = async () => {
        try {
            const res = await api.get('/api/student/attendance')
            setData(res)
        } catch (error) {
            toast.error('Failed to load attendance')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Attendance
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Loading your attendance...
                    </p>
                </div>
            </div>
        )
    }

    const pieData = [
        { name: 'Present', value: data?.stats?.presentDays || 0, color: '#2EAF4D' },
        { name: 'Absent', value: data?.stats?.absentDays || 0, color: '#EF4444' },
    ].filter(d => d.value > 0)

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">
                    Attendance
                </h1>
                <p className="text-muted-foreground mt-1">
                    Your attendance records
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border
                rounded-xl px-5 py-4">
                    <p className="text-xs text-muted-foreground">
                        Total Days
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                        {data?.stats?.totalDays || 0}
                    </p>
                </div>
                <div className="bg-card border border-border
                rounded-xl px-5 py-4">
                    <p className="text-xs text-muted-foreground">
                        Present
                    </p>
                    <p className="text-2xl font-bold text-green-500 mt-1">
                        {data?.stats?.presentDays || 0}
                    </p>
                </div>
                <div className="bg-card border border-border
                rounded-xl px-5 py-4">
                    <p className="text-xs text-muted-foreground">
                        Absent
                    </p>
                    <p className="text-2xl font-bold text-red-500 mt-1">
                        {data?.stats?.absentDays || 0}
                    </p>
                </div>
                <div className="bg-card border border-border
                rounded-xl px-5 py-4">
                    <p className="text-xs text-muted-foreground">
                        Percentage
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${
                        data?.stats?.percentage >= 75
                            ? 'text-green-500'
                            : 'text-red-500'
                    }`}>
                        {data?.stats?.percentage}%
                    </p>
                </div>
            </div>

            {/* Chart + Monthly */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Pie Chart */}
                <PieChartCard
                    title="Overall Attendance"
                    data={pieData}
                    loading={false}
                    emptyMessage="No attendance records yet."
                />

                {/* Monthly Breakdown */}
                <div className="bg-card border border-border
                rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-border">
                        <h2 className="font-semibold text-foreground">
                            Monthly Breakdown
                        </h2>
                    </div>
                    {!data?.monthly || data.monthly.length === 0 ? (
                        <div className="px-5 py-8 text-center">
                            <p className="text-sm text-muted-foreground">
                                No records yet.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {data.monthly.map((month, i) => {
                                const pct = month.total > 0
                                    ? ((month.present / month.total) * 100).toFixed(1)
                                    : 0
                                return (
                                    <div key={i}
                                        className="flex items-center
                                        justify-between px-5 py-3
                                        hover:bg-accent/20 transition-colors">
                                        <div>
                                            <p className="text-sm font-medium
                                            text-foreground">
                                                {month.label}
                                            </p>
                                            <p className="text-xs
                                            text-muted-foreground">
                                                {month.present}P · {month.absent}A · {month.total} days
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-2
                                            bg-accent rounded-full
                                            overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${
                                                        pct >= 75
                                                            ? 'bg-green-500'
                                                            : 'bg-red-500'
                                                    }`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className={`text-sm font-semibold w-12 text-right ${
                                                pct >= 75
                                                    ? 'text-green-500'
                                                    : 'text-red-500'
                                            }`}>
                                                {pct}%
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Records */}
            <div className="bg-card border border-border
            rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">
                        Recent Records
                    </h2>
                </div>
                {!data?.recent || data.recent.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            No records yet.
                        </p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-accent/30">
                                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">#</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Date</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Day</th>
                                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recent.map((record, i) => {
                                const date = new Date(record.date)
                                const isPresent = record.status === 'present'
                                return (
                                    <tr key={i}
                                        className="border-b border-border
                                        last:border-0 hover:bg-accent/20
                                        transition-colors">
                                        <td className="px-5 py-3 text-sm text-muted-foreground">
                                            {i + 1}
                                        </td>
                                        <td className="px-5 py-3 text-[12px] lg:text-sm text-foreground">
                                            {date.toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-5 py-3 text-[12px] lg:text-sm text-foreground">
                                            {date.toLocaleDateString('en-IN', {
                                                weekday: 'long'
                                            })}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <span className={`text-xs px-3 py-1
                                            rounded-full font-medium ${
                                                isPresent
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-500'
                                            }`}>
                                                {isPresent ? 'Present' : 'Absent'}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}