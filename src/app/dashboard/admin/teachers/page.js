'use client'

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Users, Plus, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AddUserDrawer from "@/components/admin/AddUserDrawer"
import FormInput from "@/components/admin/FormInput"
import FormSelect from "@/components/admin/FormSelect"


export default function TeachersPage() {
    const [showDrawer, setShowDrawer] = useState(false)
    const [submitting, setSubmitting] = useState(false)


    const handleSubmit = async () => {

    }

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

            <button onClick={() => {
                setShowDrawer(true)
            }} className="flex items-center gap-2 px-4 py-2 bg-[#0E9EAD] rounded-lg text-white text-sm font-medium hover:bg-[#0C8A98] transition-colors">
                <Plus className="h-4 w-4" />
                Add Teacher
            </button>



            <AddUserDrawer
                open={showDrawer}
                onOpenChange={setShowDrawer}
                title="Add New Teacher"
                description="Fill details. Email and password auto generated."
                onAddAnother={() => {}}
                submitting={submitting}
                onSubmit={handleSubmit}
            >
                <FormInput label="Full Name" name="name" placeholder="Enter teacher name" required />

                <FormInput label={Phone} name="phone" placeholder="Enter phone number" />

                <FormSelect label="Subject" name="subjectName" placholder="e.g. Mathematics" required />

                <FormSelect label="Class" name="class" placeholder="Select class" required  />

                <FormSelect label="Section" name="section" placholder="Select section" required />

            </AddUserDrawer>

        </div>
    )
}
