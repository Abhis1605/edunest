'use client'

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Users, Plus, Phone, Section, Key } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AddUserDrawer from "@/components/admin/AddUserDrawer"
import FormInput from "@/components/admin/FormInput"
import FormSelect from "@/components/admin/FormSelect"
import { toast } from "sonner"
import DataTable from "@/components/admin/DataTable"

const initialForm = {
    name: "",
    phone: '',
    gender: '',
    class: "",
    section: "",
    subjectName: "",
}

const columns = [
    {
        key: "name",
        label: "Name",
        render: (row) => (
            <span className="font-medium text-foreground">
                {row.userId?.name}
            </span>
        )
    },
    {
        key: 'email',
        label: "Email",
        render: (row) => row.userId?.email
    },
    {
        key: "subject",
        label: "Subject",
        render: (row) => row.subjects?.[0]?.name || '-'
    },
    {
        key: "class",
        label: "Class",
        render: (row) => `${row.assignedClasses?.[0]?.class || '-'} - ${row.assignedClasses?.[0]?.section || '-'}`
    },
    {
        key: "status",
        label: "Status",
        render: () => (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                Active
            </span>
        )
    }
]

export default function TeachersPage() {
    const [teachers, setTeachers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showDrawer, setShowDrawer] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [credentials, setCredentials] = useState(null)
    const [formData, setFormData] = useState(initialForm)

    useEffect(() => {
        fetchTeachers()
    }, [])

    const fetchTeachers = async () => {
        try {
            const data = await api.get('/api/admin/teachers')
            setTeachers(data.teachers || [] )
        } catch (error) {
            toast.error("Failed to load teachers")
        } finally{
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }


    const handleSubmit = async () => {
        if (!formData.name || !formData.gender || !formData.class || !formData.section || !formData.subjectName) {
            toast.error("Please fill all required fields")
            return;
        }
        setSubmitting(true)
        try {
            const data = await api.post('/api/admin/add-teacher', formData)
            setCredentials(data.credentials)
            setFormData(initialForm)
            fetchTeachers()
            toast.success("Teacher added successfully")
        } catch (error) {
            toast.error("Failed to add teacher")
        } finally {
            setSubmitting(false)
        }
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
                setCredentials(null)
            }} className="flex items-center gap-2 px-4 py-2 bg-[#0E9EAD] rounded-lg text-white text-sm font-medium hover:bg-[#0C8A98] transition-colors">
                <Plus className="h-4 w-4" />
                Add Teacher
            </button>


            {/* Teachers Table */}
            <Card className="mt-4"> 
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-[#0E9EAD]" />
                        All Teachers ({teachers.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={teachers} loading={loading} emptyMessage="No teachers added yet. Click Add Teacher to get started." />
                </CardContent>
            </Card>

            {/* Drawer */}
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
