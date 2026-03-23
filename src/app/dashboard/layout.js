'use client'
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useState } from "react";

export default function Layout({ children }) {

    const [isOpen, setIsOpen] = useState(true)
    const [mobileOpen, setMobileOpen] = useState(false)
    return (
        <div className="flex min-h-screen bg-background">

            {mobileOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
            )}
            <Sidebar onMobileClose={() => setMobileOpen(false)} mobileOpen={mobileOpen} onToggle={(newState) => setIsOpen(newState)} />

            <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ${ isOpen ? 'lg:ml-64' : 'lg:ml-25' }`}>
                <Topbar onMobileMenuClick={() => setMobileOpen(!mobileOpen)} />
                <main className="flex-1 p-4 md:p-6 bg-background print:p-0 print:m-0">
                    {children}
                </main>
            </div>
        </div>
    )
}