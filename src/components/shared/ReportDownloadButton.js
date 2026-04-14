'use client'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { StudentReportDocument } from './StudentReportDocument'
import { FileDown } from 'lucide-react'

export default function ReportDownloadButton({ report }) {
    return (
        <PDFDownloadLink
            document={<StudentReportDocument report={report} />}
            fileName={`${report.student?.name?.replace(/\s+/g, '_')}_Report.pdf`}
        >
            {({ loading: pdfLoading }) => (
                <button
                    className="flex items-center gap-2 px-5 py-2
                    bg-[#0E9EAD] text-white rounded-lg text-sm
                    font-medium hover:bg-[#0C8A98] transition-colors
                    disabled:opacity-50"
                    disabled={pdfLoading}
                >
                    <FileDown className="h-4 w-4" />
                    {pdfLoading ? 'Preparing...' : 'Download PDF'}
                </button>
            )}
        </PDFDownloadLink>
    )
}