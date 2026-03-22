'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts'

export default function BarChartCard({ 
    title, 
    data, 
    dataKey, 
    nameKey, 
    color = '#0E9EAD',
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
                        <BarChart
                            data={data}
                            margin={{ top: 5, right: 10,
                                      left: -20, bottom: 5 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--border)"
                            />
                            <XAxis
                                dataKey={nameKey}
                                tick={{
                                    fontSize: 12,
                                    fill: 'var(--muted-foreground)'
                                }}
                            />
                            <YAxis
                                tick={{
                                    fontSize: 12,
                                    fill: 'var(--muted-foreground)'
                                }}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--background)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    color: 'var(--foreground)'
                                }}
                            />
                            <Bar
                                dataKey={dataKey}
                                name={title}
                                fill={color}
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}