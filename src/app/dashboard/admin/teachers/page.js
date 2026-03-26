'use client'

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Users, Plus, User, Phone, Mail, Copy, Check} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AddUserDrawer from "@/components/admin/AddUserDrawer"
import FormInput from "@/components/admin/FormInput"
import FormSelect from "@/components/admin/FormSelect"
import { toast } from "sonner"
import DataTable from "@/components/admin/DataTable"
import AssignmentRows from "@/components/admin/AssignmentRows"
import { Sheet, SheetContent,SheetHeader, SheetTitle,  } from "@/components/ui/sheet"

const initialForm = {
    name: "",
    phone: '',
    gender: '',
    assignments: [{ subjectName: '', class: '', section: '' }]
}



export default function TeachersPage() {
    const [teachers, setTeachers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showDrawer, setShowDrawer] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [credentials, setCredentials] = useState(null)
    const [editingTeacher, setEditingTeacher] = useState(null)
    const [formData, setFormData] = useState(initialForm)

    const [viewingTeacher, setViewingTeacher] = useState(null)
    const [ copied, setCopied] = useState(false)

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
                <button onClick={() => setViewingTeacher(row)} 
                        className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"
                    >
                    View
                </button>
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

    const copyCredentials = (email) => {
        const password = email?.replace('@edunest.com', '@edunest')
        const text = `Email: ${email}\nPassword: ${password}`
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 2000);
    }

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
        toast('Are you sure you want to delete this teacher?', {
            action: {
                label: "Delete",
                onClick: async () => {
                    try {
                        await api.delete(`/api/admin/delete-teacher?id=${teacherId}`)
                        toast.success('Teacher deleted successfully')
                        fetchTeachers()
                    } catch (error) {
                        toast.error('Failed to delete teacher')
                    }
                }
            },
            cancel: {
                label: 'Cancel',
                onClick: () => {}
            },
            duration: 5000
        })
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
        <>
        <div>

            {/* Header */}
            <div className="flex flex-col md:flex-row lg:flex-row gap-4 lg:gap-0 lg:items-center justify-between mb-6">
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
            }} className="flex w-fit  items-center gap-2 px-4 py-2 bg-[#0E9EAD] rounded-lg text-white text-sm font-medium hover:bg-[#0C8A98] transition-colors">
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

        {/* View Teacher Sheet */}
<Sheet open={!!viewingTeacher} 
onOpenChange={(open) => !open && setViewingTeacher(null)}>
    <SheetContent className="w-full sm:max-w-md
    overflow-y-auto bg-background border-border px-6">
        <SheetHeader className="mb-8 pt-2">
            <SheetTitle className='text-xl'>Teacher Details</SheetTitle>
        </SheetHeader>

        {viewingTeacher && (
            <div className="space-y-8">

                {/* Basic Info */}
                <div>
                    <h3 className="text-sm font-semibold
                    text-muted-foreground uppercase
                    tracking-widest mb-3">
                        Basic Info
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3
                        p-4 bg-accent rounded-xl">
                            <User className="h-4 w-4
                            text-[#0E9EAD] shrink-0" />
                            <div>
                                <p className="text-xs
                                text-muted-foreground mb-0.5">
                                    Name
                                </p>
                                <p className="text-sm font-medium
                                text-foreground">
                                    {viewingTeacher.userId?.name}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3
                        p-4 bg-accent rounded-xl">
                            <Phone className="h-4 w-4
                            text-[#0E9EAD] shrink-0" />
                            <div>
                                <p className="text-xs
                                text-muted-foreground mb-0.5">
                                    Phone
                                </p>
                                <p className="text-sm font-semibold
                                text-foreground">
                                    {viewingTeacher.userId?.phone || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Credentials */}
                <div>
                    <h3 className="text-sm font-semibold
                    text-muted-foreground uppercase
                    tracking-widest mb-3">
                        Login Credentials
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3
                        p-4 bg-accent rounded-xl">
                            <Mail className="h-4 w-4
                            text-[#0E9EAD] shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs
                                text-muted-foreground mb-0.5">Email</p>
                                <p className="text-sm font-semibold
                                text-foreground truncate">
                                    {viewingTeacher.userId?.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3
                        p-4 bg-accent rounded-xl">
                            <Mail className="h-4 w-4
                            text-[#0E9EAD] shrink-0" />
                            <div>
                                <p className="text-xs
                                text-muted-foreground mb-0.5">Password</p>
                                <p className="text-sm font-semibold
                                text-foreground">
                                    {viewingTeacher.userId?.email
                                        ?.replace('@edunest.com', '@edunest')}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => copyCredentials(
                                viewingTeacher.userId?.email
                            )}
                            className="flex items-center gap-2
                            w-full px-4 py-3 bg-[#0E9EAD]
                            text-white rounded-xl text-sm font-medium
                            hover:bg-[#0C8A98] transition-colors
                            justify-center mt-1"
                        >
                            {copied
                                ? <Check className="h-4 w-4" />
                                : <Copy className="h-4 w-4" />
                            }
                            {copied ? 'Copied!' : 'Copy Credentials'}
                        </button>
                    </div>
                </div>

                {/* Assignments */}
                <div>
                    <h3 className="text-sm font-semibold
                    text-muted-foreground uppercase
                    tracking-wide mb-3">
                        Assignments
                    </h3>
                    <div className="space-y-2">
                        {viewingTeacher.assignments?.map((a, i) => (
                            <div key={i}
                                className="flex items-center
                                justify-between p-4 bg-accent
                                rounded-xl">
                                <span className="text-sm
                                font-semibold text-foreground">
                                    {a.subjectName}
                                </span>
                                <span className="text-xs px-3 py-1
                                bg-[#0E9EAD]/10 text-[#0E9EAD]
                                rounded-full font-medium">
                                    Class {a.class} — {a.section}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        )}
    </SheetContent>
</Sheet>

        </>
    )
}
