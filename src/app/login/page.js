'use client'
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState()
    const [password, setPassword] = useState()
    const [error, setError] = useState()
    const [loading, setLoading] = useState()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError('Invalid email or password')
                setLoading(false)
                return
            }

            // fetch session to get role
            const response = await fetch('/api/auth/session')
            const session = await response.json()
            const role = session?.user?.role
            const isProfileComplete = session?.user?.isProfileComplete;

            if (!isProfileComplete) {
                router.push('/setup-profile')
                return;
            }

            // Redirect based on role
            if (role === 'admin') router.push('/dashboard/admin')
            else if (role === 'teacher') router.push('/dashboard/teacher')
            else if (role === 'student') router.push('/dashboard/student')
            else if (role === 'parent') router.push('/dashboard/parent')
        } catch (error) {
            setError('Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#699640] ">

            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">

                <div className="flex justify-center mb-5">
                    <Image src='/Images/logo.png' alt="EduNest-Logo" width={200} height={80} className="object-contain"
                     />
                </div>

                {
                    error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
                            {error}
                        </div>   
                    )
                }

                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email :
                    </label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16737E] mb-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password :
                    </label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16737E]" />
                </div>

                <button onClick={handleLogin} disabled={loading} className="w-full bg-[#16737E] text-white py-2 rounded-lg font-medium hover:bg-[#2FA3B0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                    { loading ? 'Logging in...' : 'Login'}
                </button>

                <p className="text-center text-gray-400 text-xs mt-6">
                    EduNest &copy;2026. All rights reserved
                </p>

            </div>

        </div>
    )
}