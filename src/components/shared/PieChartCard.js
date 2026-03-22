'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    PieChart, Pie, Cell, Legend,
    Tooltip, ResponsiveContainer
} from 'recharts'

export default function PieChartCard({
    title,
    data,
    loading,
    emptyMessage = 'No data yet.'
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p className="text-sm text-muted-foreground">
                        Loading...
                    </p>
                ) : !data || data.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {emptyMessage}
                    </p>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={4}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={index}
                                        fill={entry.color}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--background)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    color: 'var(--foreground)'
                                }}
                            />
                            <Legend
                                iconType="circle"
                                iconSize={8}
                                formatter={(value) => (
                                    <span style={{
                                        fontSize: '12px',
                                        color: 'var(--foreground)'
                                    }}>
                                        {value}
                                    </span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}