'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { BookOpen, ClipboardList, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import StatCard from '@/components/shared/StatCard'
import PieChartCard from '@/components/shared/PieChartCard'

export default function ParentDashboard() {
    const { data: session } = useSession()
    const [dashboard, setDashboard] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboard()
    }, [])

    const fetchDashboard = async () => {
        try {
            const data = await api.get('/api/parent/dashboard')
            setDashboard(data)
        } catch (error) {
            toast.error('Failed to load dashboard')
        } finally {
            setLoading(false)
        }
    }

    const examTypeLabel = {
        unit1: 'Unit Test 1',
        unit2: 'Unit Test 2',
        midterm: 'Mid Term',
        final: 'Final Exam',
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">
                    Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                    Welcome back, {session?.user?.name} 👋
                </p>
            </div>

            {/* Child Info */}
            {!loading && dashboard && (
                <div className="flex items-center gap-3 px-4 py-3
                bg-[#0E9EAD]/10 rounded-xl border border-[#0E9EAD]/20">
                    <div>
                        <p className="text-xs text-muted-foreground">
                            Your Child
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                            {dashboard.student?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Class {dashboard.student?.class} — Section {dashboard.student?.section}
                        </p>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Attendance"
                    value={loading ? '...' : `${dashboard?.stats?.attendancePercent}%`}
                    subtitle={`${dashboard?.stats?.totalPresent || 0} of ${dashboard?.stats?.totalDays || 0} days`}
                    icon={<Users className="h-5 w-5" />}
                    bgColor="bg-[#2EAF4D]/10"
                    iconColor="text-[#2EAF4D]"
                />
                <StatCard
                    title="Subjects"
                    value={loading ? '...' : dashboard?.stats?.totalSubjects || 0}
                    subtitle="Total subjects"
                    icon={<BookOpen className="h-5 w-5" />}
                    bgColor="bg-[#0E9EAD]/10"
                    iconColor="text-[#0E9EAD]"
                />
                <StatCard
                    title="Pending Homework"
                    value={loading ? '...' : dashboard?.stats?.pendingHomework || 0}
                    subtitle="Active assignments"
                    icon={<ClipboardList className="h-5 w-5" />}
                    bgColor="bg-orange-100 dark:bg-orange-900/20"
                    iconColor="text-orange-500"
                />
            </div>

            {/* Charts + Recent Marks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Attendance Pie Chart */}
                <PieChartCard
                    title="Attendance Overview"
                    data={dashboard?.attendanceData || []}
                    loading={loading}
                    emptyMessage="No attendance records yet."
                />

                {/* Recent Marks */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            Recent Marks
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-sm text-muted-foreground">
                                Loading...
                            </p>
                        ) : dashboard?.recentMarks?.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No marks added yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {dashboard?.recentMarks?.map((mark, i) => (
                                    <div key={i}
                                        className="flex items-center
                                        justify-between py-2 border-b
                                        border-border last:border-0">
                                        <div>
                                            <p className="text-sm font-medium
                                            text-foreground">
                                                {mark.subjectName}
                                            </p>
                                            <p className="text-xs
                                            text-muted-foreground">
                                                {examTypeLabel[mark.examType]}
                                            </p>
                                        </div>
                                        <span className={`text-sm font-bold ${
                                            (mark.marks / mark.maxMarks) >= 0.7
                                                ? 'text-green-500'
                                                : (mark.marks / mark.maxMarks) >= 0.4
                                                ? 'text-yellow-500'
                                                : 'text-red-500'
                                        }`}>
                                            {mark.marks}/{mark.maxMarks}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Homework + Remarks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Homework */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            Pending Homework
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-sm text-muted-foreground">
                                Loading...
                            </p>
                        ) : dashboard?.homework?.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No pending homework.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {dashboard?.homework?.map((hw, i) => (
                                    <div key={i}
                                        className="flex items-center
                                        justify-between py-2 border-b
                                        border-border last:border-0">
                                        <div>
                                            <p className="text-sm font-medium
                                            text-foreground">
                                                {hw.title}
                                            </p>
                                            <p className="text-xs
                                            text-muted-foreground">
                                                {hw.subjectName}
                                            </p>
                                        </div>
                                        <span className="text-xs px-2 py-1
                                        bg-orange-100 dark:bg-orange-900/20
                                        text-orange-500 rounded-full">
                                            Due {new Date(hw.dueDate)
                                                .toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Remarks */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            Recent Remarks
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-sm text-muted-foreground">
                                Loading...
                            </p>
                        ) : dashboard?.remarks?.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No remarks yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {dashboard?.remarks?.map((remark, i) => (
                                    <div key={i}
                                        className="py-2 border-b
                                        border-border last:border-0">
                                        <p className="text-xs
                                        text-muted-foreground mb-1">
                                            {remark.subjectName}
                                        </p>
                                        <p className="text-sm
                                        text-foreground">
                                            {remark.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}