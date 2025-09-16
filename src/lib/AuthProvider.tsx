'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useWallet } from './WalletProvider'

interface User {
  id: string
  username: string
  email?: string
  walletAddress?: string
  loginMethod: 'technical' | 'demo'
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  loginDemo: () => void
  logout: () => void
  linkWallet: (walletAddress: string) => void
  unlinkWallet: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { publicKey, isConnected } = useWallet()

  // Restaurar sessão do localStorage
  useEffect(() => {
    const restoreSession = () => {
      console.log('🔄 Iniciando restauração de sessão...')
      try {
        const savedUser = localStorage.getItem('auth_user')
        const sessionExpiry = localStorage.getItem('auth_session_expiry')
        
        console.log('📦 Dados salvos:', { 
          hasUser: !!savedUser, 
          hasExpiry: !!sessionExpiry,
          expiry: sessionExpiry 
        })
        
        if (savedUser && sessionExpiry) {
          const expiryTime = new Date(sessionExpiry)
          const now = new Date()
          
          console.log('⏰ Verificando expiração:', {
            now: now.toISOString(),
            expiry: expiryTime.toISOString(),
            isValid: now < expiryTime
          })
          
          if (now < expiryTime) {
            const userData = JSON.parse(savedUser)
            console.log('✅ Sessão válida, restaurando usuário:', userData.username)
            setUser(userData)
          } else {
            console.log('❌ Sessão expirada, limpando dados')
            localStorage.removeItem('auth_user')
            localStorage.removeItem('auth_session_expiry')
          }
        } else {
          console.log('ℹ️ Nenhuma sessão salva encontrada')
        }
      } catch (error) {
        console.error('❌ Erro ao restaurar sessão:', error)
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_session_expiry')
      } finally {
        console.log('🏁 Finalizando carregamento da sessão')
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [])

  // Vincular automaticamente a carteira quando conectada
  useEffect(() => {
    if (user && isConnected && publicKey && user.walletAddress !== publicKey) {
      console.log('Vinculando carteira automaticamente:', publicKey)
      linkWallet(publicKey)
    }
  }, [user, isConnected, publicKey])

  // Função de login técnico
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // Aqui você implementaria a validação real com seu backend
      // Por enquanto, uma validação simples para demonstração
      if (username && password) {
        const newUser: User = {
          id: `user_${Date.now()}`,
          username,
          email: `${username}@example.com`,
          walletAddress: isConnected && publicKey ? publicKey : undefined,
          loginMethod: 'technical',
          createdAt: new Date().toISOString()
        }
        
        // Salvar usuário e definir expiração da sessão (24 horas)
        const sessionExpiry = new Date()
        sessionExpiry.setHours(sessionExpiry.getHours() + 24)
        
        localStorage.setItem('auth_user', JSON.stringify(newUser))
        localStorage.setItem('auth_session_expiry', sessionExpiry.toISOString())
        
        setUser(newUser)
        setIsLoading(false)
        return true
      }
      
      setIsLoading(false)
      return false
    } catch (error) {
      console.error('Erro no login:', error)
      setIsLoading(false)
      return false
    }
  }

  // Função de login demo
  const loginDemo = () => {
    const demoUser: User = {
      id: 'demo_user',
      username: 'Demo User',
      email: 'demo@example.com',
      walletAddress: isConnected && publicKey ? publicKey : undefined,
      loginMethod: 'demo',
      createdAt: new Date().toISOString()
    }
    
    // Sessão demo expira em 2 horas
    const sessionExpiry = new Date()
    sessionExpiry.setHours(sessionExpiry.getHours() + 2)
    
    localStorage.setItem('auth_user', JSON.stringify(demoUser))
    localStorage.setItem('auth_session_expiry', sessionExpiry.toISOString())
    
    setUser(demoUser)
  }

  // Função de logout
  const logout = () => {
    console.log('🚪 Executando logout...')
    console.trace('Stack trace do logout:')
    setUser(null)
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_session_expiry')
    console.log('✅ Logout concluído')
  }

  // Vincular carteira ao usuário
  const linkWallet = (walletAddress: string) => {
    if (user) {
      const updatedUser = {
        ...user,
        walletAddress
      }
      
      setUser(updatedUser)
      localStorage.setItem('auth_user', JSON.stringify(updatedUser))
    }
  }

  // Desvincular carteira do usuário
  const unlinkWallet = () => {
    if (user) {
      const updatedUser = {
        ...user,
        walletAddress: undefined
      }
      
      setUser(updatedUser)
      localStorage.setItem('auth_user', JSON.stringify(updatedUser))
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    loginDemo,
    logout,
    linkWallet,
    unlinkWallet,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}