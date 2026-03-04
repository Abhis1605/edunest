'use client';
import { useSession } from "next-auth/react";
import { Bell, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

const avatarMap = {
    avatar1: "/Images/avatars/avatar-1.png",
    avatar2: "/Images/avatars/avatar-2.png",
    avatar3: "/Images/avatars/avatar-3.png",
    avatar4: "/Images/avatars/avatar-4.png",
    avatar5: "/Images/avatars/avatar-5.png",
    avatar6: "/Images/avatars/avatar-6.png",
}

export default function Topbar() {
    const { data: session} = useSession()
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('theme')
        if (saved === 'dark') setIsDark(true)
    }, [])

    const toggleTheme = () => {
        const newDark = !isDark
        setIsDark(newDark)
        if (newDark) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }

    return (
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between  sticky top-0 z-10">

            <div>
                <p className="text-xs text-gray-400">
                    Welcome back
                </p>
                <h2 className="text-base font-semibold text-gray-800">
                    { session?.user?.name} 👋
                </h2>
            </div>

            {/* Right side part */}

            <div className="flex items-center gap-2">

                {/* Theme Toggle */}
                <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                    {isDark ? <Sun className="h-5 w-5 text-gray-600" /> 
                    : <Moon className="h-5 w-5 text-gray-600" />
                }
                </button>

                {/* Bell */}
                <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                    <Bell className="h-5 w-5 text-gray-600" />
                </button>

                <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-[#0E9EAD]/30 cursor-pointer">
                    <Image src={avatarMap[session?.user?.avatar] || '/Images/avatars/avatar-1.png'} alt='avatar' width={36} height={36} className="w-full h-full object-cover" />
                </div>

            </div>


        </div>
    )
}