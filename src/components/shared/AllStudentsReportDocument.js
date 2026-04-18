import {
    Document, Page, Text, View, StyleSheet,
    Image, Svg, Rect, Line, G, Path
} from '@react-pdf/renderer'

const TEAL = '#0E9EAD'
const GREEN = '#16a34a'
const RED = '#dc2626'
const ORANGE = '#ea580c'
const GRAY = '#6b7280'
const LIGHT_GRAY = '#f8f9fa'
const BORDER = '#e5e7eb'
const DARK = '#111827'
const MID = '#374151'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 8,
        color: DARK,
        backgroundColor: '#ffffff',
        paddingBottom: 60,
    },
    header: {
        backgroundColor: TEAL,
        paddingHorizontal: 28,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    logoBg: { backgroundColor: '#ffffff', borderRadius: 4, padding: 3 },
    logo: { width: 26, height: 26 },
    headerTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#fff' },
    headerSub: { fontSize: 7, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
    headerRight: { alignItems: 'flex-end' },
    headerRightTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#fff' },
    headerRightSub: { fontSize: 7, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
    body: { paddingHorizontal: 28, paddingTop: 12 },
    sectionTitle: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: MID,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 5,
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottom: `1 solid ${BORDER}`,
        paddingBottom: 4,
    },
    sectionBar: {
        width: 2.5,
        height: 8,
        backgroundColor: TEAL,
        borderRadius: 2,
        marginRight: 5,
    },
    infoGrid: {
        flexDirection: 'row',
        gap: 16,
        border: `1 solid ${BORDER}`,
        borderRadius: 5,
        padding: 10,
    },
    infoCol: { flex: 1 },
    infoRow: { flexDirection: 'row', marginBottom: 4 },
    infoLabel: { width: 76, color: GRAY, fontSize: 7 },
    infoColon: { width: 8, color: GRAY, fontSize: 7 },
    infoValue: { fontFamily: 'Helvetica-Bold', fontSize: 7, flex: 1, color: DARK },
    attendanceRow: {
        flexDirection: 'row',
        border: `1 solid ${BORDER}`,
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 8,
    },
    attCell: { flex: 1, padding: '8 6', alignItems: 'center', borderRight: `1 solid ${BORDER}` },
    attCellLast: { flex: 1, padding: '8 6', alignItems: 'center' },
    attNum: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: DARK },
    attLabel: { fontSize: 6, color: GRAY, marginTop: 1 },
    chartsRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'flex-start',
        marginBottom: 2,
    },
    table: { border: `1 solid ${BORDER}`, borderRadius: 5, overflow: 'hidden' },
    tableHeader: { flexDirection: 'row', backgroundColor: LIGHT_GRAY, borderBottom: `1 solid ${BORDER}` },
    tableRow: { flexDirection: 'row', borderTop: `1 solid ${BORDER}` },
    tableRowAlt: { flexDirection: 'row', borderTop: `1 solid ${BORDER}`, backgroundColor: '#fafafa' },
    tableRowTotal: { flexDirection: 'row', borderTop: `1 solid ${BORDER}`, backgroundColor: LIGHT_GRAY },
    tableCell: { padding: '4 6', fontSize: 7, color: MID },
    tableCellBold: { padding: '4 6', fontSize: 7, fontFamily: 'Helvetica-Bold', color: DARK },
    gradeBadge: { borderRadius: 3, paddingHorizontal: 5, paddingVertical: 1.5 },
    signatureRow: {
        position: 'absolute',
        bottom: 28,
        left: 28,
        right: 28,
        flexDirection: 'row',
        gap: 16,
    },
    signatureBox: { flex: 1, alignItems: 'center' },
    signatureLine: {
        width: '70%',
        borderTop: `1 solid ${GRAY}`,
        marginBottom: 5,
        marginTop: 20,
    },
    signatureLabel: { fontSize: 7, color: GRAY },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 28,
        paddingVertical: 5,
        borderTop: `1 solid ${BORDER}`,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    footerText: { fontSize: 6.5, color: GRAY },
})

const getGrade = (pct) => {
    const n = Number(pct)
    if (n >= 90) return { grade: 'A+', bg: '#f0fdf4', color: '#16a34a' }
    if (n >= 80) return { grade: 'A',  bg: '#f0fdf4', color: '#16a34a' }
    if (n >= 70) return { grade: 'B+', bg: '#eff6ff', color: '#2563eb' }
    if (n >= 60) return { grade: 'B',  bg: '#eff6ff', color: '#2563eb' }
    if (n >= 50) return { grade: 'C',  bg: '#fefce8', color: '#ca8a04' }
    if (n >= 40) return { grade: 'D',  bg: '#fff7ed', color: '#ea580c' }
    return             { grade: 'F',  bg: '#fef2f2', color: '#dc2626' }
}

const getMarkColor = (pct) => {
    const n = Number(pct)
    if (n >= 70) return GREEN
    if (n >= 40) return ORANGE
    return RED
}

function PieChart({ present, absent }) {
    const total = present + absent
    if (total === 0) return null
    const R = 36, CX = 46, CY = 46
    const presentPct = present / total
    const toRad = (deg) => (deg * Math.PI) / 180
    const polarToCart = (cx, cy, r, angle) => ({
        x: cx + r * Math.cos(toRad(angle - 90)),
        y: cy + r * Math.sin(toRad(angle - 90)),
    })
    const presentDeg = presentPct * 360
    const p1 = polarToCart(CX, CY, R, 0)
    const p2 = polarToCart(CX, CY, R, presentDeg)
    const largeArc1 = presentDeg > 180 ? 1 : 0
    const absentDeg = (1 - presentPct) * 360
    const p3 = polarToCart(CX, CY, R, presentDeg)
    const p4 = polarToCart(CX, CY, R, 360)
    const largeArc2 = absentDeg > 180 ? 1 : 0
    const presentPath = `M ${CX} ${CY} L ${p1.x} ${p1.y} A ${R} ${R} 0 ${largeArc1} 1 ${p2.x} ${p2.y} Z`
    const absentPath = `M ${CX} ${CY} L ${p3.x} ${p3.y} A ${R} ${R} 0 ${largeArc2} 1 ${p4.x} ${p4.y} Z`

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Svg width={92} height={92}>
                <Path d={presentPath} fill={TEAL} />
                <Path d={absentPath} fill={BORDER} />
                <Rect x={CX - 18} y={CY - 18} width={36} height={36} rx={18} fill="white" />
                <Text x={CX} y={CY - 3} fontSize={9} fontFamily="Helvetica-Bold"
                    fill={DARK} textAnchor="middle">
                    {((present / total) * 100).toFixed(0)}%
                </Text>
                <Text x={CX} y={CY + 7} fontSize={5.5} fill={GRAY} textAnchor="middle">
                    Present
                </Text>
            </Svg>
            <View style={{ gap: 6 }}>
                {[
                    { label: 'Present', value: present, color: TEAL },
                    { label: 'Absent', value: absent, color: GRAY },
                    { label: 'Total', value: total, color: DARK },
                ].map((item, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <Svg width={7} height={7}>
                            <Rect width={7} height={7} rx={1} fill={item.color} />
                        </Svg>
                        <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: item.color }}>
                            {item.value}
                        </Text>
                        <Text style={{ fontSize: 6.5, color: GRAY }}>{item.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    )
}

function BarChart({ subjects }) {
    if (!subjects || subjects.length === 0) return null
    const safeSubjects = subjects.map(s => ({
        ...s,
        subject: s.subject || '',
        percentage: Number(s.percentage) || 0,
        highestPct: Number(s.highestPct) || 0,
    }))
    const W = 278, H = 100
    const PAD = { top: 8, right: 8, bottom: 24, left: 26 }
    const chartW = W - PAD.left - PAD.right
    const chartH = H - PAD.top - PAD.bottom
    const maxVal = 100
    const barGroupWidth = chartW / safeSubjects.length
    const barWidth = Math.min(barGroupWidth * 0.26, 13)
    const gap = 2
    const yLines = [0, 25, 50, 75, 100]

    return (
        <Svg width={W} height={H}>
            {yLines.map(v => {
                const y = PAD.top + chartH - (v / maxVal) * chartH
                return (
                    <G key={v}>
                        <Line x1={PAD.left} y1={y} x2={PAD.left + chartW} y2={y}
                            stroke={BORDER} strokeWidth={0.5} />
                        <Text x={PAD.left - 3} y={y + 2} fontSize={5}
                            fill={GRAY} textAnchor="end">{v}</Text>
                    </G>
                )
            })}
            {safeSubjects.map((s, i) => {
                const studentPct = s.percentage
                const highestPct = s.highestPct
                const groupX = PAD.left + i * barGroupWidth + barGroupWidth / 2
                const x1 = groupX - barWidth - gap / 2
                const x2 = groupX + gap / 2
                const h1 = Math.max((studentPct / maxVal) * chartH, 1)
                const h2 = Math.max((highestPct / maxVal) * chartH, 1)
                const label = s.subject.length > 8 ? s.subject.slice(0, 8) + '…' : s.subject
                return (
                    <G key={i}>
                        <Rect x={x1} y={PAD.top + chartH - h1} width={barWidth}
                            height={h1} fill={TEAL} rx={1.5} />
                        <Rect x={x2} y={PAD.top + chartH - h2} width={barWidth}
                            height={h2} fill="#d1d5db" rx={1.5} />
                        <Text x={groupX} y={PAD.top + chartH + 7} fontSize={5}
                            fill={GRAY} textAnchor="middle">{label}</Text>
                    </G>
                )
            })}
            <Line x1={PAD.left} y1={PAD.top + chartH}
                x2={PAD.left + chartW} y2={PAD.top + chartH}
                stroke="#d1d5db" strokeWidth={0.8} />
            <Rect x={PAD.left} y={H - 9} width={6} height={5} fill={TEAL} rx={1} />
            <Text x={PAD.left + 8} y={H - 5} fontSize={5} fill={GRAY}>Student %</Text>
            <Rect x={PAD.left + 58} y={H - 9} width={6} height={5} fill="#d1d5db" rx={1} />
            <Text x={PAD.left + 66} y={H - 5} fontSize={5} fill={GRAY}>Class Highest %</Text>
        </Svg>
    )
}

// single student page — reused for both single and all
function StudentPage({ report }) {
    const { student, attendance, subjects, generatedAt } = report

    return (
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.logoBg}>
                        <Image src={`${BASE_URL}/Images/logo.png`} style={styles.logo} />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>EduNest</Text>
                        <Text style={styles.headerSub}>Student Management Portal</Text>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <Text style={styles.headerRightTitle}>Progress Report</Text>
                    <Text style={styles.headerRightSub}>Academic Year 2025-26</Text>
                    <Text style={styles.headerRightSub}>Generated: {generatedAt}</Text>
                </View>
            </View>

            <View style={styles.body}>
                {/* STUDENT INFO */}
                <View style={[styles.sectionTitle, { marginTop: 8 }]}>
                    <View style={styles.sectionBar} />
                    <Text>Student Information</Text>
                </View>
                <View style={styles.infoGrid}>
                    <View style={styles.infoCol}>
                        {[
                            ['Student Name', student?.name],
                            ['Class & Section', `${student?.class} — ${student?.section}`],
                            ['Email', student?.email],
                        ].map(([label, value]) => (
                            <View key={label} style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{label}</Text>
                                <Text style={styles.infoColon}>:</Text>
                                <Text style={styles.infoValue}>{value}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.infoCol}>
                        {[
                            ['Parent Name', student?.parentName || 'N/A'],
                            ['Parent Phone', student?.parentPhone || 'N/A'],
                            ['Admission Year', student?.admissionYear || 'N/A'],
                        ].map(([label, value]) => (
                            <View key={label} style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{label}</Text>
                                <Text style={styles.infoColon}>:</Text>
                                <Text style={styles.infoValue}>{value}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ATTENDANCE */}
                <View style={styles.sectionTitle}>
                    <View style={styles.sectionBar} />
                    <Text>Attendance Summary</Text>
                </View>
                <View style={styles.attendanceRow}>
                    {[
                        { label: 'Present Days', value: attendance?.presentDays, color: TEAL },
                        { label: 'Absent Days', value: attendance?.absentDays, color: MID },
                        { label: 'Total Days', value: attendance?.totalDays, color: MID },
                        {
                            label: 'Attendance %',
                            value: `${attendance?.attendancePercent}%`,
                            color: Number(attendance?.attendancePercent) >= 75 ? TEAL : RED
                        },
                    ].map(({ label, value, color }, idx) => (
                        <View key={label} style={idx === 3 ? styles.attCellLast : styles.attCell}>
                            <Text style={[styles.attNum, { color }]}>{value}</Text>
                            <Text style={styles.attLabel}>{label}</Text>
                        </View>
                    ))}
                </View>

                {/* CHARTS */}
                <View style={styles.chartsRow}>
                    <View style={{
                        border: `1 solid ${BORDER}`,
                        borderRadius: 5,
                        padding: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <PieChart
                            present={Number(attendance?.presentDays) || 0}
                            absent={Number(attendance?.absentDays) || 0}
                        />
                    </View>
                    {subjects?.length > 0 && (
                        <View style={{
                            width: 310,
                            border: `1 solid ${BORDER}`,
                            borderRadius: 5,
                            padding: 8,
                        }}>
                            <Text style={{
                                fontSize: 6.5,
                                fontFamily: 'Helvetica-Bold',
                                color: MID,
                                marginBottom: 4,
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                            }}>
                                Academic Performance
                            </Text>
                            <BarChart subjects={subjects} />
                        </View>
                    )}
                </View>

                {/* MARKS TABLE */}
                {subjects?.length > 0 && (
                    <>
                        <View style={styles.sectionTitle}>
                            <View style={styles.sectionBar} />
                            <Text>Detailed Marks</Text>
                        </View>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                {[
                                    { label: 'Subject', flex: 1.4 },
                                    { label: 'Exam', flex: 2 },
                                    { label: 'Marks', flex: 0.7, center: true },
                                    { label: 'Max', flex: 0.6, center: true },
                                    { label: '%', flex: 0.6, center: true },
                                    { label: 'Grade', flex: 0.6, center: true },
                                ].map(({ label, flex, center }) => (
                                    <Text key={label} style={[
                                        styles.tableCellBold,
                                        { flex, textAlign: center ? 'center' : 'left' }
                                    ]}>
                                        {label}
                                    </Text>
                                ))}
                            </View>

                            {subjects.map((s, i) => [
                                ...s.exams.map((e, j) => {
                                    const pct = e.maxMarks > 0
                                        ? ((e.marks / e.maxMarks) * 100).toFixed(1) : 0
                                    const { grade, bg, color } = getGrade(pct)
                                    return (
                                        <View key={`${i}-${j}`}
                                            style={(i + j) % 2 === 1 ? styles.tableRowAlt : styles.tableRow}>
                                            <Text style={[styles.tableCell, {
                                                flex: 1.4,
                                                fontFamily: j === 0 ? 'Helvetica-Bold' : 'Helvetica',
                                                color: j === 0 ? DARK : 'transparent',
                                            }]}>
                                                {j === 0 ? s.subject : ''}
                                            </Text>
                                            <Text style={[styles.tableCell, { flex: 2 }]}>
                                                {e.examTitle}
                                            </Text>
                                            <Text style={[styles.tableCellBold, { flex: 0.7, textAlign: 'center' }]}>
                                                {e.marks}
                                            </Text>
                                            <Text style={[styles.tableCell, { flex: 0.6, textAlign: 'center', color: GRAY }]}>
                                                {e.maxMarks}
                                            </Text>
                                            <Text style={[styles.tableCellBold, {
                                                flex: 0.6, textAlign: 'center',
                                                color: getMarkColor(pct)
                                            }]}>
                                                {pct}%
                                            </Text>
                                            <View style={{ flex: 0.6, padding: '4 4', alignItems: 'center', justifyContent: 'center' }}>
                                                <View style={[styles.gradeBadge, { backgroundColor: bg }]}>
                                                    <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color }}>
                                                        {grade}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    )
                                }),
                                <View key={`total-${i}`} style={styles.tableRowTotal}>
                                    <Text style={[styles.tableCellBold, { flex: 1.4, color: TEAL }]}>
                                        {s.subject} Total
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 2, color: GRAY }]}>
                                        {s.exams.length} exam{s.exams.length !== 1 ? 's' : ''}
                                    </Text>
                                    <Text style={[styles.tableCellBold, { flex: 0.7, textAlign: 'center' }]}>
                                        {s.totalMarks}
                                    </Text>
                                    <Text style={[styles.tableCellBold, { flex: 0.6, textAlign: 'center', color: GRAY }]}>
                                        {s.totalMax}
                                    </Text>
                                    <Text style={[styles.tableCellBold, {
                                        flex: 0.6, textAlign: 'center',
                                        color: getMarkColor(Number(s.percentage))
                                    }]}>
                                        {s.percentage}%
                                    </Text>
                                    <View style={{ flex: 0.6, padding: '4 4', alignItems: 'center', justifyContent: 'center' }}>
                                        <View style={[styles.gradeBadge, { backgroundColor: getGrade(Number(s.percentage)).bg }]}>
                                            <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: getGrade(Number(s.percentage)).color }}>
                                                {getGrade(Number(s.percentage)).grade}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ])}
                        </View>

                        {/* Grade scale */}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginTop: 5 }}>
                            {[
                                { r: '90-100', g: 'A+', bg: '#f0fdf4', c: '#16a34a' },
                                { r: '80-89',  g: 'A',  bg: '#f0fdf4', c: '#16a34a' },
                                { r: '70-79',  g: 'B+', bg: '#eff6ff', c: '#2563eb' },
                                { r: '60-69',  g: 'B',  bg: '#eff6ff', c: '#2563eb' },
                                { r: '50-59',  g: 'C',  bg: '#fefce8', c: '#ca8a04' },
                                { r: '40-49',  g: 'D',  bg: '#fff7ed', c: '#ea580c' },
                                { r: '0-39',   g: 'F',  bg: '#fef2f2', c: '#dc2626' },
                            ].map((g, i) => (
                                <View key={i} style={[styles.gradeBadge, { backgroundColor: g.bg, flexDirection: 'row', gap: 2 }]}>
                                    <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: g.c }}>{g.g}:</Text>
                                    <Text style={{ fontSize: 6.5, color: g.c }}>{g.r}%</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {subjects?.length === 0 && (
                    <View style={{ padding: 16, alignItems: 'center' }}>
                        <Text style={{ fontSize: 8, color: GRAY }}>
                            No exam data for this period.
                        </Text>
                    </View>
                )}
            </View>

            {/* SIGNATURES */}
            <View style={styles.signatureRow} fixed>
                {['Student Signature', 'Class Teacher', 'Parent Signature'].map((label, i) => (
                    <View key={i} style={styles.signatureBox}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureLabel}>{label}</Text>
                    </View>
                ))}
            </View>

            {/* FOOTER */}
            <View style={styles.footer} fixed>
                <Text style={styles.footerText}>EduNest — Student Management Portal</Text>
                <Text style={styles.footerText}>Computer generated report</Text>
                <Text style={styles.footerText}
                    render={({ pageNumber, totalPages }) =>
                        `Page ${pageNumber} of ${totalPages}`
                    }
                />
            </View>
        </Page>
    )
}

// all students — multi-page document
export function AllStudentsReportDocument({ reports }) {
    return (
        <Document title="Class Report" author="EduNest">
            {reports.map((report, i) => (
                <StudentPage key={i} report={report} />
            ))}
        </Document>
    )
}

// single student document
export function SingleStudentReportDocument({ report }) {
    return (
        <Document title={`Report - ${report.student?.name}`} author="EduNest">
            <StudentPage report={report} />
        </Document>
    )
}