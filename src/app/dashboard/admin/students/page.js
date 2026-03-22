'use client'

import AddUserDrawer from "@/components/admin/AddUserDrawer"
import DataTable from "@/components/admin/DataTable"
import FormInput from "@/components/admin/FormInput"
import FormSelect from "@/components/admin/FormSelect"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { api } from "@/lib/api"
import { Mail, Phone, Plus, User, Users, Check, Copy } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import CredentialsCard from '@/components/admin/CredentialsCard'



const initialForm = {
    name: '',
    phone: '',
    gender: '',
    class: '',
    section: '',
    parentName: '',
    parentPhone: '',
}

export default function StudentsPage() {
    const [ students, setStudents ] = useState([])
    const [loading, setLoading] = useState(true)
    const [showDrawer, setShowDrawer] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [credentials, setCredentials] = useState(null)
    const [editingStudent, setEditingStudent] = useState(null)
    const [viewingStudent, setViewingStudent] = useState(null)
    const [formData, setFormData] = useState(initialForm)
    const [copied, setCopied] = useState(false)

    const [filterClass, setFilterClass] = useState('')
    const [filterSection, setFilterSection] = useState("")
    const [sortOrder, setSortOrder] = useState('newest')

    const [addingParentFor, setAddingParentFor] = useState(null)
        const [parentForm, setParentForm] = useState({
            parentName: '', parentPhone: ''
        })
        const [addingParent, setAddingParent] = useState(false)
        const [parentCredentials, setParentCredentials] = useState(null)


    const columns = [
        {
            key: 'name',
            label: 'Name',
            render: (row) => (
                <span className="font-medium text-foreground">
                    {row.userId?.name}
                </span>
            )
        },
        {
            key: "email",
            label: "Email",
            render: (row) => row.userId?.email
        },
        {
            key: 'class',
            label: "Class",
            render: (row) => `Class ${row.class} - ${row.section}`
        },
        {
            key: 'parent',
            label: 'Parent',
            render: (row) => row.parentId?.name ? (
                row.parentId.name
            ) : (
                <button 
                    onClick={() => {
                        setAddingParentFor(row)
                        setParentForm({ parentName: "", parentPhone: '' })
                        setParentCredentials(null)
                    }}
                    className="text-xs px-2 py-1 rounded bg-[#2EAF4D]/10 text-[#2EAF4D] hover:bg-[#2EAF4D]/20 transition-colors"
                >
                    + Add Parent
                </button>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: () => (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                    Active
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button onClick={() => setViewingStudent(row)}
                            className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"
                        >
                        View
                    </button>
                    <button 
                        onClick={() => handleEdit(row)}
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


    const fetchStudents = async ( cls ='', section= "" , sort= "newest") => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (cls) params.append('class', cls)
            if (section) params.append("section", section)
                params.append('sort', sort)
            const data = await api.get(`/api/admin/students?${params.toString()}`)
            setStudents(data.students || [])
        } catch (error) {
            toast.error('Failed to load students')
        } finally {
            setLoading(false)
        }
    }

     useEffect(() => {
        fetchStudents(filterClass, filterSection, sortOrder)
    }, [filterClass, filterSection, sortOrder])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleEdit = (student) => {
        setEditingStudent(student)
        setFormData({
            name: student.userId?.name || '',
            phone: student.userId?.phone || '',
            gender: student.gender || '',
            class: student.class || '',
            section: student.section || '',
            parentName: student.parentId?.name || '',
            parentPhone: student.parentId?.phone || ''
        })
        setCredentials(null)
        setShowDrawer(true)
    }

    const handleDelete = async (studentId) => {
        toast('Are you sure you want to delete this student?', {
            action: {
                label: 'Delete',
                onClick: async () => {
                    try {
                        await api.delete(
                            `/api/admin/delete-student?id=${studentId}`
                        )
                        toast.success('Student deleted successfully')
                        fetchStudents()
                    } catch (error) {
                        toast.error('Failed to delete student')
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
        if (!formData.name || !formData.gender || !formData.class || !formData.section) {
            toast.error("Please fill all required fiedls")
            return
        }

        if (!editingStudent && !formData.parentName) {
            toast.error('Parent name is required')
            return
        }

        setSubmitting(true)
        try {
            if (editingStudent) {
                await api.put(
                    `/api/admin/edit-student?id=${editingStudent._id}`,
                    formData
                )
                toast.success('Student updated successfully')
                setShowDrawer(false)
            } else {
                const data = await api.post(
                    '/api/admin/add-student', formData
                )
                setCredentials(data.credentials)
                toast.success('Student added successfully!')
            }
            setFormData(initialForm)
            setEditingStudent(null)
            fetchStudents()
        } catch (error) {
            toast.error(editingStudent ? 'Failed to update student' : 'Failed to add student')
        } finally {
            setSubmitting(false)
        }
    }

    const handleAddParent= async () => {
        if (!parentForm.parentName) {
            toast.error('Parent name is required')
            return
        }
        setAddingParent(true)
        try {
            const data = await api.post('/api/admin/add-parent', {
                studentId: addingParentFor._id,
                parentName: parentForm.parentName,
                parentPhone: parentForm.parentPhone
            })
            setParentCredentials(data.credentials)
            toast.success('Parent added successfully!')
            fetchStudents(filterClass, filterSection, sortOrder)
        } catch (error) {
            toast.error('Failed to add parent')
        } finally {
            setAddingParent(false)
        }
    }

    const copyCredentials = (credentials) => {
        const text = `Student Email: ${credentials.student.email}\nStudent Password: ${credentials.student.password} \n\nParent Password: ${credentials.parent.password}`
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 2000);
    }

    return(
        <>
            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Students
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your school students
                    </p>
                </div>
                <button onClick={() => {
                    setEditingStudent(null)
                    setFormData(initialForm)
                    setCredentials(null)
                    setShowDrawer(true)
                }} className="flex items-center gap-2 px-4 py-2 bg-[#0E9EAD] rounded-lg text-white text-sm font-medium hover:bg-[#0C8A98] transition-colors">
                  <Plus className="h-4 w-4" />
                    Add Student
                </button>
                </div>

                {/* Filters */}
                <div className="flex itemce] gap-3 mb-4 flex-wrap">
                    <select value={filterClass} 
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="text-sm px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#0E9EAD]"
                    >
                        <option value="">
                            All Classes
                        </option>
                            {[8,9,10].map(c => (
                                <option key={c} value={String(c)}>
                                    Class {c}
                                </option>
                            ))}
                    </select>

                    <select value={filterSection} 
                        onChange={(e) => setFilterSection(e.target.value)}
                        className="text-sm px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#0E9EAD]"
                    >
                        <option value="">
                            All Sections
                        </option>
                        {['A', 'B'].map(s => (
                            <option key={s} value={s}>
                                Section {s}
                            </option>
                        ))}
                    </select>

                    <select 
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="text-sm px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#0E9EAD]"
                    >
                        <option value="newest">
                            Newest First 
                        </option>
                        <option value='oldest'>
                            Oldest First
                        </option>
                    </select>

                    {(filterClass || filterSection) && (
                        <button onClick={() => {
                            setFilterClass('')
                            setFilterSection('')
                        }} 
                            className="text-sm px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}

                    <span className="text-sm text-muted-foreground ml-auto">
                        {students.length} Students
                    </span>
                </div>

                {/* Students Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-[#0E9EAD]" />
                            All Students ({students.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} 
                            data={students}
                            loading={loading}
                            emptyMessage="No students added yet."
                        />
                    </CardContent>
                </Card>

                {/* Add/Edit Drawer */}
                <AddUserDrawer 
                    open={showDrawer}
                    onOpenChange={(open) => {
                        setShowDrawer(open)
                        if (!open) {
                            setEditingStudent(null)
                            setFormData(initialForm)
                        }
                    }}
                    title={editingStudent ? 'Edit Student' : 'Add New Student'}
                    description="Fill details. Email and password auto generated."
                    credentials={credentials}
                    onAddAnother={() => {
                        setCredentials(null)
                        setFormData(initialForm)
                    }}
                    submitting={submitting}
                    onSubmit={handleSubmit}
                >
                    <FormInput label='Full Name' name='name' value={formData.name} onChange={handleChange} placeholder="Enter student name" required />

                    <FormInput label="Phone" name="phone" value={formData.phone} onChange={handleChange} placeholder='Enter phone number' />

                    <FormSelect label="Gender" name="gender" value={formData.gender} onChange={handleChange} placeholder='Select gender' required  options={[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' }
                    ]}/>
                    <FormSelect label='Class' name="class" value={formData.class} onChange={handleChange} placeholder='Select class' required options={[8,9,10].map(c => ({
                        value: String(c), label: `Class ${c}`
                    }))} />
                    <FormSelect label="Section" name='section' value={formData.section} onChange={handleChange} placeholder='Select section' required options={['A', 'B'].map(s => ({
                        value: s, label: `Section ${s}`
                    }))} />

                    {/* Dividere for parent */}
                    <div className="border-t border-border pt-4 mt-2">
                        <p className="text-sm font-medium text-muted-foreground mb-3">
                            Parent Details
                        </p>
                        <div className="space-y-4">
                            <FormInput label="Parent Name" name="parentName" value={formData.parentName} onChange={handleChange} placeholder='Enter parent name' required />
                            <FormInput label='Parent Phone' name='parentPhone' value={formData.parentPhone} onChange={handleChange} placeholder='Enter parent phone' />
                        </div>
                    </div>
                </AddUserDrawer>
            </div>

            {/* View Student Sheet */}
            <Sheet open={!!viewingStudent} 
                onOpenChange={(open) => !open && setViewingStudent(null)}
            >
                <SheetContent className='w-full sm:max-w-md overflow-y-auto bg-background border-border px-6'>
                    <SheetHeader className='mb-8 pt-2'>
                        <SheetTitle className='text-xl'>
                            Student Details
                        </SheetTitle>
                    </SheetHeader>
                    {viewingStudent && (
                        <div className="space-y-8">

                            {/* Basic Info */}
                            <div>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                                    Basic Info
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 p-4 bg-accent rounded-xl">
                                        <User className="h-4 w-4 text-[#0E9EAD] shrink-0" />
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-0.5">
                                                Name
                                            </p>
                                            <p className="text-sm font-semibold text-foreground">
                                                {viewingStudent.userId?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-accent rounded-xl">
                                        <Phone className="h-4 w-4 text-[#0E9EAD] shrink-0" />
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-0.5">
                                                Class
                                            </p>
                                            <p className="text-sm font-semibold text-foreground">
                                                Class {viewingStudent.class} - {viewingStudent.section}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* student Credentials */}
                            <div>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                                    Student Login
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 p-4 bg-accent rounded-xl">
                                        <Mail className="h-4 w-4 text-[#0E9EAD]  shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground mb-0.5">
                                                Email
                                            </p>
                                            <p className="text-sm font-semibold text-foreground truncate">
                                                {viewingStudent.userId?.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-accent rounded-xl ">
                                        <Mail className="h-4 w-4 text-[#0E9EAD] shrink-0" />
                                        <div>
                                            <p className="text-xs font-semibold text-foreground mb-0.5">
                                                Password
                                            </p>
                                            <p>
                                                {viewingStudent.userId?.email?.replace('@edunest.com', '@edunest')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Parent Info */}
                            <div>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                                    Parent Login
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 p-4 bg-accent rounded-xl">
                                        <User className="h-4 w-4 text-[#0E9EAD] shrink-0" />
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-0.5">
                                                Name
                                            </p>
                                            <p className="text-sm font-semibold text-foreground">
                                                {viewingStudent.parentId?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-accent rounded-xl ">
                                        <Mail className="h-4 w-4 text-[#0E9EAD] shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground mb-0.5">
                                                Email
                                            </p>
                                            <p className="text-sm font-semibold text-foreground truncate">
                                                {viewingStudent.parentId?.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-accent rounded-xl">
                                        <Mail className="h-4 w-4 text-[#0E9EAD] shrink-0" />
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-0.5">
                                                Password
                                            </p>
                                            <p className="text-sm font-semibold text-foreground">
                                                {viewingStudent.parentId?.email?.replace('@edunest.com', '@edunest')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Copy Button */}
                            <button
                                onClick={() => copyCredentials({
                                    student: {
                                        email: viewingStudent.userId?.email,
                                        password: viewingStudent.userId?.email
                                            ?.replace('@edunest.com', '@edunest')
                                    },
                                    parent: {
                                        email: viewingStudent.parentId?.email,
                                        password: viewingStudent.parentId?.email
                                            ?.replace('@edunest.com', '@edunest')
                                    }
                                })}
                                className="flex items-center gap-2
                                w-full px-4 py-3 bg-[#0E9EAD]
                                text-white rounded-xl text-sm font-medium
                                hover:bg-[#0C8A98] transition-colors
                                justify-center"
                            >
                                {copied
                                    ? <Check className="h-4 w-4" />
                                    : <Copy className="h-4 w-4" />
                                }
                                {copied ? 'Copied!' : 'Copy All Credentials'}
                            </button>

                        </div>
                    )}
                </SheetContent>
            </Sheet>

           {/* Add Parent Sheet */}
<Sheet open={!!addingParentFor}
onOpenChange={(open) => {
    if (!open) {
        setAddingParentFor(null)
        setParentCredentials(null)
        setParentForm({ parentName: '', parentPhone: '' })
    }
}}>
    <SheetContent className="w-full sm:max-w-md
    overflow-y-auto bg-background border-border px-6">
        <SheetHeader className="mb-8 pt-2">
            <SheetTitle className="text-xl">
                Add Parent
            </SheetTitle>
            <p className="text-sm text-muted-foreground">
                Adding parent for {addingParentFor?.userId?.name}
            </p>
        </SheetHeader>

        {parentCredentials ? (
            <CredentialsCard
                credentials={parentCredentials}
                onAddAnother={null}
                onClose={() => {
                    setAddingParentFor(null)
                    setParentCredentials(null)
                }}
            />
        ) : (
            <div className="space-y-4">
                <FormInput
                    label="Parent Name"
                    name="parentName"
                    value={parentForm.parentName}
                    onChange={(e) => setParentForm({
                        ...parentForm,
                        parentName: e.target.value
                    })}
                    placeholder="Enter parent name"
                    required
                />
                <FormInput
                    label="Parent Phone"
                    name="parentPhone"
                    value={parentForm.parentPhone}
                    onChange={(e) => setParentForm({
                        ...parentForm,
                        parentPhone: e.target.value
                    })}
                    placeholder="Enter parent phone"
                />
                <div className="flex gap-2 pt-4">
                    <button
                        onClick={handleAddParent}
                        disabled={addingParent}
                        className="flex-1 py-2 bg-[#0E9EAD]
                        text-white rounded-lg text-sm font-medium
                        hover:bg-[#0C8A98] transition-colors
                        disabled:opacity-50"
                    >
                        {addingParent ? 'Adding...' : 'Add Parent'}
                    </button>
                    <button
                        onClick={() => setAddingParentFor(null)}
                        className="flex-1 py-2 bg-accent
                        text-foreground rounded-lg text-sm
                        hover:bg-accent/80 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )}
    </SheetContent>
</Sheet>
        </>
    )
}