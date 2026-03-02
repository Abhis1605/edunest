'use client'
import { createContext, useContext } from "react"
import { useSession} from 'next-auth/react'

const AuthContext =createContext()

export function AuthProvider({ children }){
    const { data: session, status } = useSession()

    const user = session?.user || null;
    const isLoading = status === 'loading';
    const isAuthenticated = status === 'authenticated'

    return(
        <AuthContext.Provider value={
            {
                user,
                isLoading,
                isAuthenticated,
            }
        }>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}