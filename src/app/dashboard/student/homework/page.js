'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export default function StudentHomeworkPage() {
    const [active, setActive] = useState([])
    const [past, setPast] = useState([])
    const [loading, setLoading] = useState(true)
    const [showPast, setShowPast] = useState(false)

    useEffect(() => {
        fetchHomework()
    }, [])

    const fetchHomework = async () => {
        try {
            const data = await api.get('/api/student/homework')
            setActive(data.active || [])
            setPast(data.past || [])
        } catch (error) {
            toast.error('Failed to load homework')
        } finally {
            setLoading(false)
        }
    }

    const getDaysLeft = (dueDate) => {
        const diff = new Date(dueDate) - new Date()
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
        if (days === 0) return 'Due today'
        if (days === 1) return 'Due tomorrow'
        return `${days} days left`
    }

    const getDueBadgeColor = (dueDate) => {
        const diff = new Date(dueDate) - new Date()
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
        if (days <= 1) return 'bg-red-100 dark:bg-red-900/30 text-red-500'
        if (days <= 3) return 'bg-orange-100 dark:bg-orange-900/20 text-orange-500'
        return 'bg-green-100 dark:bg-green-900/30 text-green-600'
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Homework
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Loading homework...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex gap-3 md:gap-0 lg:gap-0 flex-col md:flex-row lg:flex-row  lg:items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Homework
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Your assigned homework
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm lg:text-xs px-4 py-2 lg:px-3 lg:py-1
                    bg-[#0E9EAD]/10 text-[#0E9EAD] rounded-full">
                        {active.length} Active
                    </span>
                    <span className=" text-sm lg:text-xs px-4 py-2 lg:px-3 lg:py-1
                    bg-gray-100 dark:bg-gray-800
                    text-gray-500 rounded-full">
                        {past.length} Completed
                    </span>
                </div>
            </div>

            {/* Active Homework */}
            <div className="bg-card border border-border
            rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">
                        Pending Homework
                    </h2>
                </div>

                {active.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                        <p className="text-sm text-muted-foreground">
                            No pending homework! 🎉
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {active.map((hw, i) => (
                            <div key={i}
                                className="px-5 py-4 hover:bg-accent/20
                                transition-colors">
                                <div className="flex items-start
                                justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center
                                        gap-2 mb-1">
                                            <span className="text-xs px-2 py-0.5
                                            bg-[#0E9EAD]/10 text-[#0E9EAD]
                                            rounded font-medium">
                                                {hw.subjectName}
                                            </span>
                                        </div>
                                        <p className="text-sm font-semibold
                                        text-foreground">
                                            {hw.title}
                                        </p>
                                        {hw.description && (
                                            <p className="text-xs
                                            text-muted-foreground mt-1">
                                                {hw.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className={`text-xs px-3 py-1
                                        rounded-full font-medium
                                        ${getDueBadgeColor(hw.dueDate)}`}>
                                            {getDaysLeft(hw.dueDate)}
                                        </span>
                                        <p className="text-xs
                                        text-muted-foreground mt-1">
                                            {new Date(hw.dueDate)
                                                .toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Past Homework */}
            {past.length > 0 && (
                <div className="bg-card border border-border
                rounded-xl overflow-hidden">
                    <button
                        onClick={() => setShowPast(!showPast)}
                        className="w-full flex items-center
                        justify-between px-5 py-4 hover:bg-accent/20
                        transition-colors"
                    >
                        <h2 className="font-semibold text-foreground">
                            Completed Homework ({past.length})
                        </h2>
                        <span className="text-xs text-muted-foreground">
                            {showPast ? 'Hide ▲' : 'Show ▼'}
                        </span>
                    </button>

                    {showPast && (
                        <div className="divide-y divide-border
                        border-t border-border">
                            {past.map((hw, i) => (
                                <div key={i}
                                    className="px-5 py-4 hover:bg-accent/20
                                    transition-colors opacity-60">
                                    <div className="flex items-start
                                    justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center
                                            gap-2 mb-1">
                                                <span className="text-xs
                                                px-2 py-0.5 bg-gray-100
                                                dark:bg-gray-800
                                                text-gray-500 rounded
                                                font-medium">
                                                    {hw.subjectName}
                                                </span>
                                            </div>
                                            <p className="text-sm
                                            font-semibold text-foreground
                                            line-through">
                                                {hw.title}
                                            </p>
                                            {hw.description && (
                                                <p className="text-xs
                                                text-muted-foreground mt-1">
                                                    {hw.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-xs px-3
                                            py-1 rounded-full font-medium
                                            bg-gray-100 dark:bg-gray-800
                                            text-gray-500">
                                                Completed
                                            </span>
                                            <p className="text-xs
                                            text-muted-foreground mt-1">
                                                {new Date(hw.dueDate)
                                                    .toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}