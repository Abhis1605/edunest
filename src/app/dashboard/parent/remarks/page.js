'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'

export default function ParentRemarksPage() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchRemarks()
    }, [])

    const fetchRemarks = async () => {
        try {
            const res = await api.get('/api/parent/remarks')
            setData(res)
        } catch (error) {
            toast.error('Failed to load remarks')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Remarks
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Loading remarks...
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
                    Remarks
                </h1>
                <p className="text-muted-foreground mt-1">
                    {data?.studentName
                        ? `${data.studentName}'s remarks`
                        : "Your child's remarks"}
                </p>
            </div>

            {!data?.subjects || data.subjects.length === 0 ? (
                <div className="bg-card border border-border
                rounded-xl px-5 py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                        No remarks added yet.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {data.subjects.map((subject, i) => (
                        <div key={i} className="bg-card border
                        border-border rounded-xl overflow-hidden">

                            {/* Subject Header */}
                            <div className="px-5 py-4 border-b
                            border-border bg-accent/30">
                                <h2 className="font-semibold
                                text-foreground">
                                    {subject.subject}
                                </h2>
                                <p className="text-xs
                                text-muted-foreground mt-0.5">
                                    {subject.remarks.length} remark{subject.remarks.length > 1 ? 's' : ''}
                                </p>
                            </div>

                            {/* Remarks */}
                            <div className="divide-y divide-border">
                                {subject.remarks.map((remark, j) => (
                                    <div key={j}
                                        className="px-5 py-4
                                        hover:bg-accent/20
                                        transition-colors">
                                        <div className="flex items-start
                                        justify-between gap-4">
                                            <p className="text-sm
                                            text-foreground flex-1">
                                                {remark.content}
                                            </p>
                                            <div className="text-right
                                            shrink-0">
                                                {remark.isAiGenerated && (
                                                    <span className="flex
                                                    items-center gap-1
                                                    text-xs text-purple-500
                                                    mb-1">
                                                        <Sparkles className="h-3 w-3" />
                                                        AI
                                                    </span>
                                                )}
                                                <p className="text-xs
                                                text-muted-foreground">
                                                    {new Date(remark.createdAt)
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
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}