import Link from "next/link"
import { Plus } from "lucide-react"

export default function QuickActions() {
    return (
        <div className="flex flex-col md:flex-row lg:flex-row 
         lg:items-center justify-between gap-3 lg:gap-0">
            <h2 className="text-lg  font-semibold text-foreground">
                Quick Actions
            </h2>
            <div className="flex gap-3 lg:flex-wrap">
                <Link
                    href="/dashboard/admin/teachers"
                    className="flex items-center gap-2 p-2 lg:px-4 lg:py-2
                    bg-[#0E9EAD] text-white rounded-md lg:rounded-lg text-[13px] lg:text-sm
                    font-medium hover:bg-[#0C8A98] transition-colors"
                >
                    <Plus className= " h-3 w-3 lg:h-4 lg:w-4" />
                    Add Teacher
                </Link>
                <Link
                    href="/dashboard/admin/students"
                    className="flex items-center gap-2 p-2 lg:px-4 lg:py-2
                    bg-[#2EAF4D] text-white rounded-md lg:rounded-lg text-[13px] lg:text-sm
                    font-medium hover:bg-[#278F40] transition-colors"
                >
                    <Plus className=" h-3 w-3 lg:h-4 lg:w-4" />
                    Add Student
                </Link>
                <Link
                    href="/dashboard/admin/parents"
                    className="flex items-center gap-2 p-2 lg:px-4 lg:py-2
                    bg-orange-500 text-white rounded-md lg:rounded-lg text-[13px] lg:text-sm
                    font-medium hover:bg-orange-600 transition-colors"
                >
                    <Plus className=" h-3 w-3 lg:h-4 lg:w-4" />
                    Add Parent
                </Link>
            </div>
        </div>
    )
}