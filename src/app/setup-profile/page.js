'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

const avatars = [
    { id: "avatar1", src: "/Images/avatars/avatar-1.png"},
    { id: "avatar2", src:"/Images/avatars/avatar-2.png"},
    { id: "avatar3", src:"/Images/avatars/avatar-3.png"},
    { id: "avatar4", src:"/Images/avatars/avatar-4.png"},
    { id: "avatar5", src:"/Images/avatars/avatar-5.png"},
    { id: "avatar6", src:"/Images/avatars/avatar-6.png"},
]

export default function SetupProfilePage() {
    const router = useRouter()
    const { data: session, update } = useSession()
    const [selectedAvatar, setSelectedAvatar] = useState('avatar1')
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/user/setup-profile', {
                method: 'POST',
                headers: { 'Content-Type': "application/json" },
                body: JSON.stringify({avatar: selectedAvatar })
            })

            if (res.ok) {

              await update({
                avatar: selectedAvatar,
                isProfileComplete: true
              })
                const role = session?.user?.role
                if (role === 'admin') router.push('/dashboard/admin')
                else if (role === 'teacher') router.push('/dashboard/teacher')
                else if (role === 'student') router.push('/dashboard/student')
                else if (role === 'parent') router.push('/dashboard/parent')
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center 
    justify-center bg-[#699640]">
      <div className="bg-white p-8 rounded-xl shadow-md 
      w-full max-w-md">

        <h1 className="text-2xl font-bold text-center 
        text-gray-800 mb-2">
          Welcome to <span className="text-[#699640]">EduNest!</span>
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Choose your avatar to get started
        </p>

        {/* Avatar Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              onClick={() => setSelectedAvatar(avatar.id)}
              className={`cursor-pointer rounded-xl p-2 border-2 
              transition-all ${
                selectedAvatar === avatar.id
                  ? 'border-[#699640] bg-green-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <Image
                src={avatar.src}
                alt={avatar.id}
                width={80}
                height={80}
                className="w-full h-auto rounded-lg"
              />
            </div>
          ))}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-[#16737E] text-white py-2 
          rounded-lg font-medium hover:bg-[#2FA3B0] 
          transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>

      </div>
    </div>
  );
}
