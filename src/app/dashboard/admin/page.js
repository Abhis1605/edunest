'use client'
import { useState, useEffect } from "react"
import { api } from "@/lib/api"

import QuickActions from "../QuickActions"
import RecentStudents from "../RecentStudents"
import RecentTeachers from "../RecentTeachers"
import StatesSection from "../StatesSection"
import ChartsSection from "../ChartsSection"

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalTeachers: 0,
        totalStudents: 0,
        totalParents: 0,
        studentsByClass: [],
        genderData: [],
    })
    const [recentTeachers, setRecentTeachers] = useState([])
    const [recentStudents, setRecentStudents] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const [statsData, teachersData, studentsData] = await Promise.all([
                api.get('/api/admin/stats'),
                api.get('/api/admin/teachers'),
                api.get('/api/admin/students?sort=newest'),
            ])
            setStats({
                totalTeachers: statsData.totalTeachers || 0,
                totalStudents: statsData.totalStudents || 0,
                totalParents: statsData.totalParents || 0,
                studentsByClass: statsData.studentsByClass || [],
                genderData: statsData.genderData || [],
            })
            setRecentTeachers(
                (teachersData.teachers || []).slice(0, 5)
            )
            setRecentStudents(
                (studentsData.students || []).slice(0, 5)
            )
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">
                    Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                    Overview of your school
                </p>
            </div>

            {/* Stats */}
            <StatesSection stats={stats} loading={loading} />

            {/* Quick Actions */}
            <QuickActions />

            <ChartsSection stats={stats} loading={loading} />

            {/* Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RecentTeachers
                    teachers={recentTeachers}
                    loading={loading}
                />
                <RecentStudents
                    students={recentStudents}
                    loading={loading}
                />
            </div>

        </div>
    )
}