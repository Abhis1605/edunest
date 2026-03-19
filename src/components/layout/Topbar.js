"use client";
import { useSession } from "next-auth/react";
import { Bell, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

const avatarMap = {
  avatar1: "/Images/avatars/avatar-1.png",
  avatar2: "/Images/avatars/avatar-2.png",
  avatar3: "/Images/avatars/avatar-3.png",
  avatar4: "/Images/avatars/avatar-4.png",
  avatar5: "/Images/avatars/avatar-5.png",
  avatar6: "/Images/avatars/avatar-6.png",
};

const avatarList = [
  { id: "avatar1", src: "/Images/avatars/avatar-1.png" },
  { id: "avatar2", src: "/Images/avatars/avatar-2.png" },
  { id: "avatar3", src: "/Images/avatars/avatar-3.png" },
  { id: "avatar4", src: "/Images/avatars/avatar-4.png" },
  { id: "avatar5", src: "/Images/avatars/avatar-5.png" },
  { id: "avatar6", src: "/Images/avatars/avatar-6.png" },
];

export default function Topbar() {
  const { data: session, update } = useSession();
  const [isDark, setIsDark] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (session?.user?.avatar) {
      setSelectedAvatar(session.user.avatar);
    }
  }, [session]);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleAvatarSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/setup-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: selectedAvatar }),
      });
      if (res.ok) {
        await update({ avatar: selectedAvatar });
        setShowAvatarModal(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
        <div className=" print:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between  sticky top-0 z-10 dark:border-gray-700 dark:bg-background">
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500">Welcome back</p>
        <h2 className="text-base font-semibold text-gray-800 dark:text-white">
          {session?.user?.name} 👋
        </h2>
      </div>

      {/* Right side part */}

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Moon className="h-5 w-5 text-gray-600" />
          )}
        </button>

        {/* Bell */}
        <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700">
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        <button
          onClick={() => setShowAvatarModal(true)}
          className="h-9 w-9 rounded-full overflow-hidden
    border-2 border-[#0E9EAD]/30 cursor-pointer
    hover:border-[#0E9EAD] transition-all"
        >
          <Image
            src={
              avatarMap[session?.user?.avatar] || "/Images/avatars/avatar-1.png"
            }
            alt="avatar"
            width={36}
            height={36}
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </div>


    {/* Avatar Modal */}
        {showAvatarModal && (
            <div className="fixed inset-0 z-50 flex items-center
            justify-center bg-black/50">
                <div className="bg-background border border-border
                rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">

                    <h2 className="text-lg font-semibold
                    text-foreground mb-1">
                        Change Avatar
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Select your new avatar
                    </p>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {avatarList.map((avatar) => (
                            <div
                                key={avatar.id}
                                onClick={() => setSelectedAvatar(avatar.id)}
                                className={`cursor-pointer rounded-xl
                                p-2 border-2 transition-all ${
                                    selectedAvatar === avatar.id
                                        ? 'border-[#0E9EAD] bg-[#0E9EAD]/10'
                                        : 'border-border hover:border-[#0E9EAD]/50'
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

                    <div className="flex gap-2">
                        <button
                            onClick={handleAvatarSave}
                            disabled={saving}
                            className="flex-1 py-2 bg-[#0E9EAD]
                            text-white rounded-lg text-sm font-medium
                            hover:bg-[#0C8A98] transition-colors
                            disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Avatar'}
                        </button>
                        <button
                            onClick={() => setShowAvatarModal(false)}
                            className="flex-1 py-2 bg-accent
                            text-foreground rounded-lg text-sm
                            hover:bg-accent/80 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>

                </div>
            </div>
        )}
    </>
  );
}
