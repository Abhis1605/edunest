'use client';
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    ClipboardList,
    BookOpen,
    FileText,
    MessageSquare,
    Download,
    Heart,
    LogOut,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import { useState } from "react";


const navLinks = {
    admin: [
        { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
        { label: "Teachers", href: "/dashboard/admin/teachers", icon: Users },
        { label: "Students", href: "/dashboard/admin/students", icon: GraduationCap },
        { label: "Parents", href: "/dashboard/admin/parents", icon: Heart }
    ],
    teacher: [
        { label: "Dashboard", href: "/dashboard/teacher", icon: LayoutDashboard },
        { label: "Attendance", href: "/dashboard/teacher/attendance", icon: ClipboardList },
        { label: "Marks", href: "/dashboard/teacher/marks", icon: BookOpen },
        { label: "Homework", href: "/dashboard/teacher/homework", icon: FileText },
        { label: "Remarks", href: "/dashboard/teacher/remarks", icon: MessageSquare },
        { label: "Attendance Excel", href: "/dashboard/teacher/download-excel", icon: Download },
        { label: "Student Reports", href: "/dashboard/teacher/reports", icon: FileText },
    ], 
    student: [
        { label: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
        { label: "Marks", href: "/dashboard/student/marks", icon: BookOpen },
        { label: "Attendance", href: "/dashboard/student/attendance", icon: ClipboardList },
        { label: "Homework", href: "/dashboard/student/homework", icon: FileText },
        { label: "Download Report", href: "/dashboard/student/report", icon: Download },
    ],
    parent: [
        { label: "Dashboard", href: "/dashboard/parent", icon: LayoutDashboard },
        { label: "Marks", href: "/dashboard/parent/marks", icon: BookOpen },
        { label: "Attendance", href: "/dashboard/parent/attendance", icon: ClipboardList },
        { label: "Remarks", href: "/dashboard/parent/remarks", icon: MessageSquare },
        { label: "Download Report", href: "/dashboard/parent/report", icon: Download }
    ]
}

export default function Sidebar({ onToggle }){
    const pathname = usePathname()
    const { data: session } = useSession()
    const role = session?.user?.role
    const links = navLinks[role] || []
    const [isOpen, setIsOpen] = useState(true)

    const handleToggle = () => {
        const newState = !isOpen
        setIsOpen(newState)
        onToggle && onToggle(newState)
    }

    return (
        <div className={`h-screen  bg-white border-r border-gray-200 fixed left-0 top-0 flex flex-col transition-all duration-300 ${isOpen ? 'w-45' : 'w-`10'}`}>
           
            {/* Logo Part */}
            <div className="p-2 border-b border-gray-200 flex justify-center items-center h-22">
                {
                    isOpen ? (
                        <Image src="/Images/logo.png" width={250} height={80} alt='EduNest-logo' className="object-contain" />
                    ) : (
                        <Image src="/Images/logo-sidebar.png" width={50} height={50} alt='EduNest-logo' className="object-contain" />
                    )
                }
            </div>

            {/* Nav Links */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                { links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href

                    return(
                        <Link key={link.href}
                            href={link.href}
                            title={!isOpen ? link.label : ''}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium  transition-all ${isActive ? 'bg-[#0E9EAD]/10 text-[#0E9EAD] border-l-4 border-[#0E9EAD]' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                        >
                            <Icon className={`h-5 w-5 ${isActive ? 'text-[#0E9EAD]': 'text-gray-400'}`} />{ 
                                isOpen && (
                                    <span>
                                        {link.label}
                                    </span>
                                )
                            }

                            {/* Tooltip when collapsed */}
                            { !isOpen && (
                                <div className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                    {link.label}
                                </div>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* User info + Logout */}

            <div className="mt-auto p-4 border-t border-gray-200 space-y-1">

                <button onClick={() => signOut({ callbackUrl: '/login'} )} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg text-red-500 hover:text-red-300 transition-colors">
                    <LogOut className="h-4 w-4 shrink-0" />
                    { isOpen && <span>Logout</span>}
                </button>


                <div className="flex items-center gap-3 mb-3 py-2">


                    <div className="h-9 w-9 rounded-full bg-[#0E9EAD]/10 flex items-center shrink-0 justify-center font-bold text-sm text-[#0E9EAD]">
                        {session?.user?.name?.charAt(0).toUpperCase()}
                    </div>


                    { isOpen && (
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-800 truncate">
                                { session?.user?.name}
                            </p>
                        </div>
                    )}
                    
                </div>

                <button onClick={handleToggle}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                    {
                        isOpen ? (
                            <>
                                <ChevronLeft className="h-5 w-5 shrink-0 text-gray-400 " />
                                <span>Collapse</span>
                            </>
                        ) : (
                            <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
                        )
                    }
                </button>

            </div>

        </div>
    )
}