'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, ClipboardList, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import StatCard from '@/components/shared/StatCard'
import { toast } from 'sonner'

export default function TeacherDashboard() {
    const { data: session } = useSession()
    const [dashboard, setDashboard] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboard()
    }, [])

    const fetchDashboard = async () => {
        try {
            const data = await api.get('/api/teacher/dashboard')
            setDashboard(data)
        } catch (error) {
            toast.error('Failed to load dashboard')
        } finally {
            setLoading(false)
        }
    }

    const totalStudents = dashboard?.teacher?.assignments?.reduce(
        (sum, a) => sum + (a.studentCount || 0), 0
    ) || 0

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

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="My Students"
                    value={loading ? '...' : totalStudents}
                    subtitle="Across all classes"
                    icon={<Users className="h-5 w-5" />}
                    bgColor="bg-[#0E9EAD]/10"
                    iconColor="text-[#0E9EAD]"
                />
                <StatCard
                    title="My Classes"
                    value={loading ? '...' : 
                        dashboard?.teacher?.assignments?.length || 0}
                    subtitle="Assigned classes"
                    icon={<BookOpen className="h-5 w-5" />}
                    bgColor="bg-[#2EAF4D]/10"
                    iconColor="text-[#2EAF4D]"
                />
                <StatCard
                    title="Pending Homework"
                    value={loading ? '...' : 
                        dashboard?.pendingHomework || 0}
                    subtitle="Active assignments"
                    icon={<ClipboardList className="h-5 w-5" />}
                    bgColor="bg-orange-100 dark:bg-orange-900/20"
                    iconColor="text-orange-500"
                />
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Link href="/dashboard/teacher/attendance"
                        className="flex flex-col items-center gap-2
                        p-4 bg-[#0E9EAD]/10 rounded-xl
                        hover:bg-[#0E9EAD]/20 transition-colors">
                        <ClipboardList className="h-6 w-6 text-[#0E9EAD]" />
                        <span className="text-sm font-medium
                        text-foreground">
                            Take Attendance
                        </span>
                    </Link>
                    <Link href="/dashboard/teacher/marks"
                        className="flex flex-col items-center gap-2
                        p-4 bg-[#2EAF4D]/10 rounded-xl
                        hover:bg-[#2EAF4D]/20 transition-colors">
                        <BookOpen className="h-6 w-6 text-[#2EAF4D]" />
                        <span className="text-sm font-medium
                        text-foreground">
                            Enter Marks
                        </span>
                    </Link>
                    <Link href="/dashboard/teacher/homework"
                        className="flex flex-col items-center gap-2
                        p-4 bg-orange-100 dark:bg-orange-900/20
                        rounded-xl hover:bg-orange-200
                        dark:hover:bg-orange-900/30 transition-colors">
                        <ClipboardList className="h-6 w-6
                        text-orange-500" />
                        <span className="text-sm font-medium
                        text-foreground">
                            Assign Homework
                        </span>
                    </Link>
                    <Link href="/dashboard/teacher/remarks"
                        className="flex flex-col items-center gap-2
                        p-4 bg-purple-100 dark:bg-purple-900/20
                        rounded-xl hover:bg-purple-200
                        dark:hover:bg-purple-900/30 transition-colors">
                        <BookOpen className="h-6 w-6
                        text-purple-500" />
                        <span className="text-sm font-medium
                        text-foreground">
                            Add Remarks
                        </span>
                    </Link>
                </div>
            </div>

            {/* My Classes + Recent Homework */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* My Classes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            My Classes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-sm text-muted-foreground">
                                Loading...
                            </p>
                        ) : dashboard?.teacher?.assignments?.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No classes assigned yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {dashboard?.teacher?.assignments?.map((a, i) => (
                                    <div key={i}
                                        className="flex items-center
                                        justify-between py-2 border-b
                                        border-border last:border-0">
                                        <div>
                                            <p className="text-sm font-medium
                                            text-foreground">
                                                {a.subjectName}
                                            </p>
                                            <p className="text-xs
                                            text-muted-foreground">
                                                Class {a.class} — {a.section}
                                            </p>
                                        </div>
                                        <span className="text-xs px-2 py-1
                                        bg-[#0E9EAD]/10 text-[#0E9EAD]
                                        rounded-full">
                                            {a.studentCount} students
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Homework */}
                <Card>
                    <CardHeader className="flex flex-row items-center
                    justify-between pb-3">
                        <CardTitle className="text-base font-semibold">
                            Recent Homework
                        </CardTitle>
                        <Link
                            href="/dashboard/teacher/homework"
                            className="text-xs text-[#0E9EAD]
                            hover:underline flex items-center gap-1"
                        >
                            View all
                            <ChevronRight className="h-3 w-3" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-sm text-muted-foreground">
                                Loading...
                            </p>
                        ) : dashboard?.recentHomework?.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No homework assigned yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {dashboard?.recentHomework?.map((hw, i) => (
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
                                                {hw.subjectName} — Class {hw.class}{hw.section}
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

            </div>
        </div>
    )
}