'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Plus, Trash2, } from 'lucide-react'

export default function HomeworkPage() {
    const [assignments, setAssignments] = useState([])
    const [homework, setHomework] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subjectName: '',
        cls: '',
        section: '',
        dueDate: '',
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [dashData, hwData] = await Promise.all([
                api.get('/api/teacher/dashboard'),
                api.get('/api/teacher/homework')
            ])
            setAssignments(dashData.teacher?.assignments || [])
            setHomework(hwData.homework || [])
        } catch (error) {
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async () => {
        if (!formData.title || !formData.subjectName ||
            !formData.cls || !formData.section || !formData.dueDate) {
            toast.error('Please fill all required fields')
            return
        }

        // Validate due date is not in past
        const today = new Date().toISOString().split('T')[0]
        if (formData.dueDate < today) {
            toast.error('Due date cannot be in the past')
            return
        }

        setSubmitting(true)
        try {
            await api.post('/api/teacher/homework', formData)
            toast.success('Homework assigned successfully!')
            setFormData({
                title: '',
                description: '',
                subjectName: '',
                cls: '',
                section: '',
                dueDate: '',
            })
            setShowForm(false)
            fetchData()
        } catch (error) {
            toast.error('Failed to assign homework')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        toast('Delete this homework?', {
            action: {
                label: 'Delete',
                onClick: async () => {
                    try {
                        await api.delete(`/api/teacher/homework?id=${id}`)
                        toast.success('Homework deleted')
                        fetchData()
                    } catch (error) {
                        toast.error('Failed to delete')
                    }
                }
            },
            cancel: { label: 'Cancel', onClick: () => {} },
            duration: 5000,
        })
    }

    // Get unique classes
    const uniqueClasses = [...new Set(assignments.map(a => a.class))]

    // Get sections for selected class
    const sectionsForClass = assignments
        .filter(a => a.class === formData.cls)
        .map(a => a.section)

    // Get subjects for selected class+section
    const subjectsForClass = assignments
        .filter(a => a.class === formData.cls &&
                     a.section === formData.section)
        .map(a => a.subjectName)

    const today = new Date().toISOString().split('T')[0]

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Homework
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Assign homework to your students
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2
                    bg-[#0E9EAD] text-white rounded-lg text-sm
                    font-medium hover:bg-[#0C8A98] transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    {showForm ? 'Cancel' : 'Assign Homework'}
                </button>
            </div>

            {/* Add Homework Form */}
            {showForm && (
                <div className="bg-card border border-border
                rounded-xl p-5 space-y-4">
                    <h2 className="font-semibold text-foreground">
                        New Homework
                    </h2>

                    {/* Title */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">
                            Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Complete Exercise 3"
                            className="text-sm px-3 py-2 rounded-lg
                            border border-border bg-background
                            text-foreground focus:outline-none
                            focus:ring-1 focus:ring-[#0E9EAD]"
                        />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Add details about the homework..."
                            rows={3}
                            className="text-sm px-3 py-2 rounded-lg
                            border border-border bg-background
                            text-foreground focus:outline-none
                            focus:ring-1 focus:ring-[#0E9EAD]
                            resize-none"
                        />
                    </div>

                    {/* Class Section Subject Due Date */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">
                                Class *
                            </label>
                            <select
                                name="cls"
                                value={formData.cls}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        cls: e.target.value,
                                        section: '',
                                        subjectName: ''
                                    })
                                }}
                                className="text-sm px-3 py-2 rounded-lg
                                border border-border bg-background
                                text-foreground focus:outline-none
                                focus:ring-1 focus:ring-[#0E9EAD]"
                            >
                                <option value="">Select</option>
                                {uniqueClasses.map(c => (
                                    <option key={c} value={c}>
                                        Class {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">
                                Section *
                            </label>
                            <select
                                name="section"
                                value={formData.section}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        section: e.target.value,
                                        subjectName: ''
                                    })
                                }}
                                disabled={!formData.cls}
                                className="text-sm px-3 py-2 rounded-lg
                                border border-border bg-background
                                text-foreground focus:outline-none
                                focus:ring-1 focus:ring-[#0E9EAD]
                                disabled:opacity-50"
                            >
                                <option value="">Select</option>
                                {sectionsForClass.map(s => (
                                    <option key={s} value={s}>
                                        Section {s}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">
                                Subject *
                            </label>
                            <select
                                name="subjectName"
                                value={formData.subjectName}
                                onChange={handleChange}
                                disabled={!formData.section}
                                className="text-sm px-3 py-2 rounded-lg
                                border border-border bg-background
                                text-foreground focus:outline-none
                                focus:ring-1 focus:ring-[#0E9EAD]
                                disabled:opacity-50"
                            >
                                <option value="">Select</option>
                                {subjectsForClass.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">
                                Due Date *
                            </label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                min={today}
                                onChange={handleChange}
                                className="text-sm px-3 py-2 rounded-lg
                                border border-border bg-background
                                text-foreground focus:outline-none
                                focus:ring-1 focus:ring-[#0E9EAD]"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-6 py-2 bg-[#0E9EAD]
                            text-white rounded-lg text-sm font-medium
                            hover:bg-[#0C8A98] transition-colors
                            disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : 'Assign Homework'}
                        </button>
                    </div>
                </div>
            )}

            {/* Homework List */}
            <div className="bg-card border border-border
            rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">
                        All Homework ({homework.length})
                    </h2>
                </div>

                {loading ? (
                    <div className="px-5 py-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            Loading...
                        </p>
                    </div>
                ) : homework.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            No homework assigned yet.
                        </p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-accent/30">
                                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">#</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Title</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Subject</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Class</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Due Date</th>
                                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {homework.map((hw, i) => {
                                const isPast = new Date(hw.dueDate) < new Date()
                                return (
                                    <tr key={hw._id}
                                        className="border-b border-border
                                        last:border-0 hover:bg-accent/20
                                        transition-colors">
                                        <td className="px-5 py-3 text-sm text-muted-foreground">
                                            {i + 1}
                                        </td>
                                        <td className="px-5 py-3">
                                            <p className="text-sm font-medium text-foreground">
                                                {hw.title}
                                            </p>
                                            {hw.description && (
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                                    {hw.description}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-sm text-foreground">
                                            {hw.subjectName}
                                        </td>
                                        <td className="px-5 py-3 text-sm text-foreground">
                                            Class {hw.class} — {hw.section}
                                        </td>
                                        <td className="px-5 py-3 text-sm text-foreground">
                                            {new Date(hw.dueDate)
                                                .toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`text-xs px-2 py-1
                                            rounded-full font-medium ${
                                                isPast
                                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                                    : 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                            }`}>
                                                {isPast ? 'Completed' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => handleDelete(hw._id)}
                                                    className="p-1.5 rounded-lg
                                                    bg-red-100 dark:bg-red-900/30
                                                    text-red-500 hover:bg-red-200
                                                    transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}