import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RecentTeachers({ teachers, loading }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center
            justify-between pb-3">
                <CardTitle className="text-base font-semibold">
                    Recent Teachers
                </CardTitle>
                <Link
                    href="/dashboard/admin/teachers"
                    className="text-xs text-[#0E9EAD]
                    hover:underline flex items-center gap-1"
                >
                    View all
                    <ArrowRight className="h-3 w-3" />
                </Link>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p className="text-sm text-muted-foreground">
                        Loading...
                    </p>
                ) : teachers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No teachers added yet.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {teachers.map((teacher, i) => (
                            <div key={i}
                                className="flex items-center
                                justify-between py-2 border-b
                                border-border last:border-0">
                                <div>
                                    <p className="text-sm font-medium
                                    text-foreground">
                                        {teacher.userId?.name}
                                    </p>
                                    <p className="text-xs
                                    text-muted-foreground">
                                        {teacher.assignments?.[0]?.subjectName
                                            || 'No subject assigned'}
                                    </p>
                                </div>
                                <span className="text-xs px-2 py-1
                                bg-[#0E9EAD]/10 text-[#0E9EAD]
                                rounded-full shrink-0">
                                    {teacher.assignments?.[0]?.class
                                        ? `Class ${teacher.assignments[0].class}`
                                        : 'N/A'
                                    }
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}