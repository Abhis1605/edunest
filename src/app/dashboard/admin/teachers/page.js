'use client'

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Users, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AddUserDrawer from "@/components/admin/AddUserDrawer"
import FormInput from "@/components/admin/FormInput"
import FormSelect from "@/components/admin/FormSelect"
import { toast } from "sonner"
import DataTable from "@/components/admin/DataTable"
import AssignmentRows from "@/components/admin/AssignmentRows"

const initialForm = {
    name: "",
    phone: '',
    gender: '',
    assignments: [{ subjectName: '', class: '', section: '' }]
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
        key: 'assignments',
        label: 'Assignments',
        render: (row) => (
            <div className="space-y-1">
                {row.assignments?.map((a, i) => (
                    <span key={i} className="inline-block mr-1 px-2 py-0.5 bg-[#0E9EAD]/10 text-[#0E9EAD] rounded text-xs ">
                        {a.subjectName} - {a.class}{a.section}
                    </span>
                ))}
            </div>
        )
    },
    {
        key: 'status',
        label: 'Status',
        render: () => (
            <span className="px-2 py-1 bg-green-100
            dark:bg-green-900/30 text-green-700
            dark:text-green-400 rounded-full text-xs font-medium">
                Active
            </span>
        ),
    },
    {
        key: "actions",
        label: "Actions",
        render: (row) => (
            <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(row)} 
                    className="text-xs px-2 py-1 rounded bg-[#0E9EAD]/10 text-[#0E9EAD] hover:bg-[#0E9EAD]/20 transition-colors"
                    >
                    Edit
                </button>
                <button onClick={() => handleDelete(row._id)}
                    className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 transition-colors"
                    >
                    Delete
                </button>
            </div>
        )
    }
]

export default function TeachersPage() {
    const [teachers, setTeachers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showDrawer, setShowDrawer] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [credentials, setCredentials] = useState(null)
    const [editingTeacher, setEditingTeacher] = useState(null)
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

    const handleEdit = (teacher) => {
        setEditingTeacher(teacher)
        setFormData({
            name: teacher.userId?.name || '',
            phone: teacher.userId?.phone || '',
            gender: teacher.userId?.gender || '',
            assignments: teacher.assignments?.length > 0 ? teacher.assignments : [{ subjectName: '', class: '', section: '' }]
        })
        setCredentials(null)
        setShowDrawer(true)
    }

    const handleDelete = async (teacherId) => {
        if (!confirm('Are you sure you want to delete this teacher?')) return
        try {
            await api.delete(`/api/admin/delete-teacher?id=${teacherId}`)
            toast.success('Teacher deleted successfully')
            fetchTeachers()
        } catch (error) {
            toast.error("Failed to delete teacher")
        }
    }

    const handleSubmit = async () => {
        if (!formData.name || !formData.gender) {
            toast.error("Please fill all required fields")
            return;
        }

        if (!formData.assignments || formData.assignments.length === 0) {
            toast.error('Please add at least one assignment')
            return
        }

        const invalidAssignment = formData.assignments.some(
            a => !a.subjectName || !a.class || !a.section
        )
        if (invalidAssignment) {
            toast.error('Please fill all assignment fields')
            return
        }
        setSubmitting(true)
        try {
            if (editingTeacher) {
                await api.put(`/api/admin/edit-teacher?id=${editingTeacher._id}`, formData )
                toast.success('Teacher updated successfully')
                setShowDrawer(false)
            } else {
                const data = await api.post(
                    `/api/admin/add-teacher`, formData
                )
                setCredentials(data.credentials)
                toast.success('Teacher added successfully')
            }
            setFormData(initialForm)
            setEditingTeacher(null)
            fetchTeachers()
        } catch (error) {
            toast.error(editingTeacher ? 'Failed to update teacher' : 'failed to add teacher')
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

                <button onClick={() => {
                    setEditingTeacher(null)
                    setFormData(initialForm)
                    setCredentials(null)
                    setShowDrawer(true)
            }} className="flex items-center gap-2 px-4 py-2 bg-[#0E9EAD] rounded-lg text-white text-sm font-medium hover:bg-[#0C8A98] transition-colors">
                <Plus className="h-4 w-4" />
                Add Teacher
            </button>
            
            </div>

            
            {/* Teachers Table */}
            <Card className="mt-4"> 
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-[#0E9EAD]" />
                        All Teachers ({teachers.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={teachers} loading={loading} emptyMessage="No teachers added yet." />
                </CardContent>
            </Card>

            {/* Drawer */}
            <AddUserDrawer
                open={showDrawer}
                onOpenChange={(open) => {
                    setShowDrawer(open)
                    if (!open) {
                        setEditingTeacher(null)
                        setFormData(initialForm)
                    }
                }}
                title={editingTeacher ? "Edit Teacher" : "Add New Teacher"}
                description="Fill details. Email and password auto generated."
                credentials={credentials}
                onAddAnother={() => {
                    setCredentials(null)
                    setFormData(initialForm)
                }}
                submitting={submitting}
                onSubmit={handleSubmit}
            >
                <FormInput value={formData.name} onChange={handleChange} label="Full Name" name="name" placeholder="Enter teacher name" required />

                <FormInput label="Phone" name="phone" placeholder="Enter phone number"  onChange={handleChange} value={formData.phone} />

                <FormSelect label="Gender" name="gender" value={formData.gender} onChange={handleChange} placeholder="Select gender" required options={[
                    { value: "male", label: "Male"},
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other" }
                ]} />

                <AssignmentRows 
                    assignments={formData.assignments}
                    onChange={(updated) => setFormData({
                        ...formData, assignments: updated
                    })}
                />

            </AddUserDrawer>

        </div>
    )
}
