'use client'
import { PDFDownloadLink } from '@react-pdf/renderer'
import {
    AllStudentsReportDocument,
    SingleStudentReportDocument
} from './AllStudentsReportDocument'
import { FileDown, Users } from 'lucide-react'

export function AllStudentsDownloadButton({ reports, cls, section }) {
    return (
        <PDFDownloadLink
            document={<AllStudentsReportDocument reports={reports} />}
            fileName={`Class_${cls}_${section}_All_Reports.pdf`}
        >
            {({ loading }) => (
                <button
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5
                    bg-[#0E9EAD] text-white rounded-lg text-sm font-medium
                    hover:bg-[#0C8A98] transition-colors disabled:opacity-50"
                >
                    <Users className="h-4 w-4" />
                    {loading ? 'Preparing...' : 'Download All Students'}
                </button>
            )}
        </PDFDownloadLink>
    )
}

export function SingleStudentDownloadButton({ report }) {
    return (
        <PDFDownloadLink
            document={<SingleStudentReportDocument report={report} />}
            fileName={`${report.student?.name?.replace(/\s+/g, '_')}_Report.pdf`}
        >
            {({ loading }) => (
                <button
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5
                    bg-[#0E9EAD] text-white rounded-lg text-xs font-medium
                    hover:bg-[#0C8A98] transition-colors disabled:opacity-50"
                >
                    <FileDown className="h-3.5 w-3.5" />
                    {loading ? '...' : 'Download'}
                </button>
            )}
        </PDFDownloadLink>
    )
}