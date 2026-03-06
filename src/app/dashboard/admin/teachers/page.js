'use client'

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Users, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AddUserDrawer from "@/components/admin/AddUserDrawer"


export default function TeachersPage() {
    return (
        <div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Teachers
                    </h1>

                    <p className="text-muted-foreground mt-1">
                        Manage your school teachers
                    </p>

                </div>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-[#0E9EAD] rounded-lg text-white text-sm font-medium hover:bg-[#0C8A98] transition-colors">
                <Plus className="h-4 w-4" />
                Add Teacher
            </button>



            <AddUserDrawer>
                
            </AddUserDrawer>

        </div>
    )
}
