'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/lib/WalletProvider'
import ConnectButton from '@/components/ConnectButton'

interface User {
  id: string
  name: string
  email: string
  membershipStatus: 'active' | 'inactive' | 'pending'
  joinDate: string
}

interface Club {
  id: string
  name: string
  members: number
  status: 'active' | 'inactive'
  createdDate: string
}

export default function AdminPanel() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDemoMode = searchParams.get('demo') === 'true'
  const [activeTab, setActiveTab] = useState('users')
  const { isConnected, publicKey } = useWallet()

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }
  
  // Mock data para usuários
  const [users] = useState<User[]>([
    { id: '1', name: 'João Silva', email: 'joao@email.com', membershipStatus: 'active', joinDate: '2024-01-15' },
    { id: '2', name: 'Maria Santos', email: 'maria@email.com', membershipStatus: 'active', joinDate: '2024-02-20' },
    { id: '3', name: 'Pedro Costa', email: 'pedro@email.com', membershipStatus: 'pending', joinDate: '2024-03-10' },
    { id: '4', name: 'Ana Oliveira', email: 'ana@email.com', membershipStatus: 'inactive', joinDate: '2024-01-05' },
  ])
  
  // Mock data para clubes
  const [clubs] = useState<Club[]>([
    { id: '1', name: 'Yacht Owners Club', members: 128, status: 'active', createdDate: '2023-12-01' },
    { id: '2', name: 'Sailing Enthusiasts', members: 256, status: 'active', createdDate: '2023-11-15' },
    { id: '3', name: 'Mediterranean Cruisers', members: 89, status: 'active', createdDate: '2024-01-20' },
    { id: '4', name: 'Ocean Explorers', members: 45, status: 'inactive', createdDate: '2024-02-10' },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/30'
      case 'inactive': return 'text-red-400 bg-red-900/30'
      case 'pending': return 'text-yellow-400 bg-yellow-900/30'
      default: return 'text-gray-400 bg-gray-900/30'
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Admin Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo e Título */}
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">
              Capys Club - Admin
            </h1>
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
              ADMIN
            </span>
          </div>

          {/* Navigation e Wallet */}
          <div className="flex items-center space-x-6">
            <nav className="flex items-center space-x-4">
              <Button 
                onClick={() => router.push(isDemoMode ? '/dashboard?demo=true' : '/dashboard')}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Dashboard
              </Button>
              <Button 
                onClick={() => router.push('/')}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Home
              </Button>
            </nav>
            
            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {isConnected && publicKey ? (
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-300">
                    <span className="text-green-400">●</span> {formatAddress(publicKey)}
                  </div>
                  <ConnectButton className="px-4 py-2" />
                </div>
              ) : (
                <ConnectButton />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Title */}
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-bold text-white">
              Painel Administrativo
            </h2>
            <div className="text-sm text-gray-400">
              Gerencie usuários, clubes e analytics da plataforma
            </div>
          </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-700">
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'users' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('users')}
          >
            Usuários
          </button>
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'clubs' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('clubs')}
          >
            Clubes
          </button>
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'analytics' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Gerenciar Usuários</h2>
              <div className="text-sm text-gray-400">
                Total: {users.length} usuários
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data de Entrada</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.membershipStatus)}`}>
                          {user.membershipStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.joinDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-400 hover:text-blue-300 mr-3">Editar</button>
                        <button className="text-red-400 hover:text-red-300">Remover</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Clubs Tab */}
        {activeTab === 'clubs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Gerenciar Clubes</h2>
              <div className="text-sm text-gray-400">
                Total: {clubs.length} clubes
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome do Clube</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Membros</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data de Criação</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {clubs.map((club) => (
                    <tr key={club.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{club.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{club.members}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(club.status)}`}>
                          {club.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{club.createdDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-400 hover:text-blue-300 mr-3">Editar</button>
                        <button className="text-red-400 hover:text-red-300">Remover</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Analytics do Sistema</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Total de Usuários</h3>
                <p className="text-3xl font-bold text-blue-400">{users.length}</p>
                <p className="text-sm text-gray-400 mt-1">+12% este mês</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Clubes Ativos</h3>
                <p className="text-3xl font-bold text-green-400">{clubs.filter(c => c.status === 'active').length}</p>
                <p className="text-sm text-gray-400 mt-1">+5% este mês</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Membros Ativos</h3>
                <p className="text-3xl font-bold text-purple-400">{users.filter(u => u.membershipStatus === 'active').length}</p>
                <p className="text-sm text-gray-400 mt-1">+8% este mês</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Total de Membros em Clubes</h3>
                <p className="text-3xl font-bold text-yellow-400">{clubs.reduce((acc, club) => acc + club.members, 0)}</p>
                <p className="text-sm text-gray-400 mt-1">+15% este mês</p>
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-4">Atividade Recente</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-300">Novo usuário registrado: Pedro Costa</span>
                  <span className="text-sm text-gray-500">2 horas atrás</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-300">Clube criado: Ocean Explorers</span>
                  <span className="text-sm text-gray-500">1 dia atrás</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-300">Usuário ativado: Maria Santos</span>
                  <span className="text-sm text-gray-500">3 dias atrás</span>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
