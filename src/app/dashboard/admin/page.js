'use client'
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Users, GraduationCap, Heart, Subtitles } from "lucide-react"
import { api } from "@/lib/api"
import StatCard from "@/components/shared/StatCard"


export default function AdminDashboard() {

    const { data: session } = useSession()
    const [stats, setStats] = useState({
        totalTeachers : 0,
        totalStudents : 0,
        totalParents : 0,
    }) 
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const data = api.get('/api/admin/stats')
            setStats(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const stateCards = [
        {
            title: "Total Teachers",
            value: loading ? '...' : stats.totalTeachers,
            Subtitle: "Active teachers",
            icon: <Users className="h-5 w-5" />,
            bgColor: 'bg-[#0E9EAD]/10',
            iconColor: 'text-[#0E9EAD]'
        },
        {
            title: "Total Students",
            value: loading ? '...' : stats.totalStudents,
            Subtitle: "Active students",
            icon: <Users className="h-5 w-5" />,
            bgColor: 'bg-[#2EAF4D]/10',
            iconColor: 'text-[#2EAF4D]',
        },
        {
            title: "Total Parents",
            value: loading ? '...' : stats.totalParents,
            Subtitle: "Active parents",
            icon: <Users className="h-5 w-5" />,
            bgColor: 'bg-orange-100',
            iconColor: 'text-orange-500',
        }
    ]

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Dashboard
                </h1>
                <p>
                    Overview of your school
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {
                        stateCards.map((card, index) => (
                            <StatCard 
                                key={index}
                                title={card.title}
                                value={card.value}
                                subtitle={card.Subtitle}
                                icon={card.icon}
                                bgColor={card.bgColor}
                                iconColor={card.iconColor}
                            />
                        ))
                    }
            </div>

        </div>
    )
}