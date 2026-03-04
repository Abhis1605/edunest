'use client'
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Users, GraduationCap, Heart } from "lucide-react"

export default function AdminDashboard() {

    const { data: session } = useSession()
    const [stats, setStats] = useState({
        totalTeachers : 0,
        totalStudents : 0,
        totalParents : 0,
    }) 
    const [loading, setLoading] = useState(true)

    return (
        <div>
            <p>Admin Dashboard Working</p>
        </div>
    )
}