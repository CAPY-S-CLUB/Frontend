'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Aqui você implementaria a lógica de autenticação real
    // Por enquanto, apenas uma validação simples
    if (username && password) {
      // Redirecionar para o dashboard após login bem-sucedido
      router.push('/dashboard')
    } else {
      setError('Por favor, preencha todos os campos')
    }
  }

  const handleDemoAccount = () => {
    // Redirecionar para o dashboard com conta demo
    router.push('/dashboard?demo=true')
  }

  return (
    <main className="relative min-h-screen text-white w-full">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?q=80&w=2000&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="absolute inset-0 z-10 bg-black/60" />
      <div className="relative z-20 flex flex-col items-center justify-center h-full w-full p-4 sm:p-8">
        <div className="bg-black/80 p-8 rounded-lg w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
          
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1">
                Nome de Usuário
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors duration-200"
            >
              Entrar
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-3">ou</p>
            <Button 
              onClick={handleDemoAccount}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white py-2 rounded-lg transition-colors duration-200"
            >
              Gerar Conta Demo
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}