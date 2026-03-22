'use client';
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/context/AuthContext";

export default function SessionWrapper({ children }){
    return(
        <SessionProvider>
            <AuthProvider>
                {children}
            </AuthProvider>
        </SessionProvider>
    )
}