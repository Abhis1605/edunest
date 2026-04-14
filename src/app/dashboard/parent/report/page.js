'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

const ParentReportDownloadButton = dynamic(
    () => import('@/components/shared/ParentReportDownloadButton'),
    {
        ssr: false,
        loading: () => (
            <button className="flex items-center gap-2 px-5 py-2
            bg-[#0E9EAD]/50 text-white rounded-lg text-sm font-medium">
                Preparing...
            </button>
        )
    }
)

export default function ParentReportPage() {
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(false)

    const fetchReport = async () => {
        if (!fromDate || !toDate) {
            toast.error('Please select both from and to dates')
            return
        }
        if (fromDate > toDate) {
            toast.error('From date cannot be after to date')
            return
        }
        setReport(null)
        setLoading(true)
        try {
            const data = await api.get(
                `/api/parent/report?from=${fromDate}&to=${toDate}`
            )
            if (!data.subjects || data.subjects.length === 0) {
                toast.error('No exam data found for this date range')
                return
            }
            setReport(data)
        } catch {
            toast.error('Failed to load report')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">
                    Child Report
                </h1>
                <p className="text-muted-foreground mt-1">
                    Select a date range and download your child's progress report
                </p>
            </div>

            {/* Date range picker */}
            <div className="flex flex-wrap items-end gap-4 p-4
            bg-card border border-border rounded-xl">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">
                        From Date
                    </label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={e => setFromDate(e.target.value)}
                        className="text-sm px-3 py-2 rounded-lg border
                        border-border bg-background text-foreground
                        focus:outline-none focus:ring-1 focus:ring-[#0E9EAD]"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">
                        To Date
                    </label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={e => setToDate(e.target.value)}
                        className="text-sm px-3 py-2 rounded-lg border
                        border-border bg-background text-foreground
                        focus:outline-none focus:ring-1 focus:ring-[#0E9EAD]"
                    />
                </div>
                <button
                    onClick={fetchReport}
                    disabled={loading}
                    className="px-5 py-2 bg-[#0E9EAD] text-white
                    rounded-lg text-sm font-medium hover:bg-[#0C8A98]
                    transition-colors disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Generate'}
                </button>
            </div>

            {/* Report ready */}
            {report && report.subjects?.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center
                justify-between gap-4 p-4 bg-card border border-border
                rounded-xl">
                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            Report Ready — {report.student?.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(fromDate).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                            })}
                            {' — '}
                            {new Date(toDate).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                            })}
                            {' · '}
                            {report.subjects?.length} subject{report.subjects?.length !== 1 ? 's' : ''}
                            {' · '}
                            {report.attendance?.totalDays} attendance days
                        </p>
                    </div>
                    <ParentReportDownloadButton report={report} />
                </div>
            )}

            {/* No data */}
            {report && report.subjects?.length === 0 && (
                <div className="bg-card border border-border rounded-xl
                px-5 py-10 text-center">
                    <p className="text-sm font-semibold text-foreground">
                        No exam data found
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        No exams were recorded between{' '}
                        {new Date(fromDate).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                        })}
                        {' and '}
                        {new Date(toDate).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                        })}
                    </p>
                </div>
            )}
        </div>
    )
}