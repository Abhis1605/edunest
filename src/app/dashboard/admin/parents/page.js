'use client'

import DataTable from "@/components/admin/DataTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { api } from "@/lib/api"
import { Check, Copy, Mail, Phone, User, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"


export default function ParentsPage() {
    const [parents, setParents] = useState([])
    const [loading, setLoading] = useState(true)
    const [viewingParent, setViewingParent] = useState(null)
    const [copied, setCopied] = useState(false)

    const columns = [
        {
            key: 'name',
            label: 'Name',
            render: (row) => (
                <span className="font-medium text-foreground">
                    {row.name}
                </span>
            )
        },
        {
            key: 'email',
            label: 'Email',
            render: (row) => row.email
        },
        {
            key: "phone",
            label: 'Phone',
            render: (row) => row.phone || 'N/A'
        },
        {
            key: 'children',
            label: 'Child',
            render: (row) => (
                <div className="space-y-1">
                    {row.children?.map((child, i) => (
                        <span key={i} className="inline-block mr-1 px-2 py-0.5 bg-[#0E9EAD]/10 text-[#0E9EAD] rounded text-xs">
                            {child.name} - {child.class}{child.section}
                        </span>
                    ))}
                </div>
            )
        },
        {
            key: "status",
            label: "Status",
            render: () => (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                    Active
                </span>
            )
        },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setViewingParent(row)}
                        className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors "
                    > 
                        View
                    </button>
                    <button onClick={() => handleDelete(row._id)} className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 transition-colors">
                        Delete
                    </button>
                </div>
            )
        }
    ]

    useEffect(() => {
        fetchParent()
    }, [])

    const fetchParent = async () => {
        try {
            const data = await api.get('/api/admin/parents')
            setParents(data.parents || [])
        } catch (error) {
            toast.error("Failed to load parents")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (parentId) => {
        toast('Are you sure you want to delete this parent?', {
            action: {
                label: "Delete",
                onClick: async () => {
                    try {
                        await api.delete(
                            `/api/admin/delete-parent?id=${parentId}`
                        )
                        toast.success('Parent deleted successfully')
                        fetchParent()
                    } catch (error) {
                        toast.error("Failed to delete parent")
                    }
                }
            },
            cancel: {
                label: "Cancel",
                onClick: () => {}
            },
            duration: 3000,
        })
    }

    const copyCredentials = (parent) => {
        const password = parent.email?.replace('@edunest.com', '@edunest')
        const text = `Email: ${parent.email}\nPassword: ${password}`
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 2000);
    }

    return (
        <>
            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div >
                        <h1 className="text-2xl font-bold text-foreground">
                            Parents
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your School parents
                        </p>
                    </div>
                </div>

                {/* Parents Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-[#0E9EAD]" />
                            All Parents ({parents.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable 
                            columns={columns} data={parents} loading={loading} emptyMessage="No parents found. Parents are created automatically when studetns are added."
                        />
                    </CardContent>
                </Card>
            </div>


            {/* Viewing parent Sheet */}
            <Sheet 
                open={!!viewingParent}
                onOpenChange={(open) => !open && setViewingParent(null)}
            >
                <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-background border-border px-6">
                    <SheetHeader className="mb-8 pt-2">
                        <SheetTitle className="text-xl">
                            Parent Details
                        </SheetTitle>
                    </SheetHeader>

                    { viewingParent && (
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
                                                {viewingParent.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-accent rounded-xl">
                                        <Phone className="h-4 w-4 text-[#0E9EAD] shrink-0" />
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-0.5">
                                                Phone
                                            </p>
                                            <p className="text-sm font-semibold text-foreground">
                                                {viewingParent.phone || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Login Credentais */}

                            <div>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                                    Login Credentials
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 p-4 bg-accent rounded-xl">
                                        <Mail className="h-4 w-4 text-[#0E9EAD] shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground mb-0.5">
                                                Email
                                            </p>
                                            <p className="text-sm font-semibold text-foreground truncate">
                                                {viewingParent.email}
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
                                                {viewingParent.email?.replace('@edunest.com', '@edunest')}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => copyCredentials(viewingParent)} className="flex items-center gap-2 w-full px-4 py-3 bg-[#0E9EAD] text-white rounded-xl text-sm font-medium hover:bg-[#0C8A98] transition-colors justify-center">
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        {copied ? 'Copied!' : 'Copy Credentials'}
                                    </button>
                                </div>
                            </div>

                            {/* children */}
                            <div>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                                    Children
                                </h3>
                                <div className="space-y-2">
                                    {viewingParent.children?.map((child, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-accent rounded-xl">
                                            <span className="text-sm font-semibold text-foreground">
                                                {child.name}
                                            </span>
                                            <span className="text-xs px-3 py-1 bg-[#0E9EAD]/10 text-[#0E9EAD] rounded-full font-medium">
                                                Class {child.class} - {child.section}
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