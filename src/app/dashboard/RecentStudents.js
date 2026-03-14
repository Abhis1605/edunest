import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RecentStudents({ students, loading }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center
            justify-between pb-3">
                <CardTitle className="text-base font-semibold">
                    Recent Students
                </CardTitle>
                <Link
                    href="/dashboard/admin/students"
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
                ) : students.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No students added yet.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {students.map((student, i) => (
                            <div key={i}
                                className="flex items-center
                                justify-between py-2 border-b
                                border-border last:border-0">
                                <div>
                                    <p className="text-sm font-medium
                                    text-foreground">
                                        {student.userId?.name}
                                    </p>
                                    <p className="text-xs
                                    text-muted-foreground">
                                        {student.parentId?.name
                                            ? `Parent: ${student.parentId.name}`
                                            : 'No parent assigned'
                                        }
                                    </p>
                                </div>
                                <span className="text-xs px-2 py-1
                                bg-[#2EAF4D]/10 text-[#2EAF4D]
                                rounded-full shrink-0">
                                    Class {student.class} — {student.section}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}