'use client'
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useState } from "react";

export default function Layout({ children }) {

    const [isOpen, setIsOpen] = useState(true)
    return (
        <div className="flex">
            <Sidebar onToggle={(newState) => setIsOpen(newState)} />
            <div className={`flex-1 p-6 transition-all duration-300 ${ isOpen ? 'ml-64' : 'ml-25' }`}>
                <Topbar />
                {children}
            </div>
        </div>
    )
}