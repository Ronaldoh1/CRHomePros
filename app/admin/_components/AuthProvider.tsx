'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { type User } from 'firebase/auth'
import { onAuthChange, isAdmin, logout } from '@/lib/firebase-auth'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsub = onAuthChange((firebaseUser) => {
      if (firebaseUser && isAdmin(firebaseUser)) {
        setUser(firebaseUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!loading && !user && pathname !== '/admin/login') {
      router.replace('/admin/login')
    }
  }, [user, loading, pathname, router])

  const handleSignOut = async () => {
    await logout()
    router.replace('/admin/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  )
}
