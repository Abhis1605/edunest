import BarChartCard from "@/components/shared/BarChartCard"
import PieChartCard from "@/components/shared/PieChartCard"

export default function ChartsSection({ stats, loading }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BarChartCard
                title="Students by Class"
                data={stats.studentsByClass}
                dataKey="count"
                nameKey="class"
                color="#0E9EAD"
                loading={loading}
                emptyMessage="No student data yet."
            />
            <PieChartCard
                title="Gender Distribution"
                data={stats.genderData}
                loading={loading}
                emptyMessage="No student data yet."
            />
        </div>
    )
}