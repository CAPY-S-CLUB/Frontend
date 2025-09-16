'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/lib/WalletProvider'
import { useHeader } from '@/lib/HeaderProvider'
import ConnectButton from '@/components/ConnectButton'
import { clubService, Club as ApiClub, CreateClubData } from '@/services/clubService'

interface User {
  id: string
  name: string
  email: string
  membershipStatus: 'active' | 'inactive' | 'pending'
  joinDate: string
}

// Usando interface do clubService
type Club = ApiClub

function AdminPanelContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDemoMode = searchParams.get('demo') === 'true'
  const [activeTab, setActiveTab] = useState('users')
  const { isConnected, publicKey } = useWallet()
  const { hideHeader, showHeader } = useHeader()

  useEffect(() => {
    // Hide global header when entering admin page
    hideHeader()
    
    // Show header again when leaving the page
    return () => {
      showHeader()
    }
  }, [hideHeader, showHeader])

  // Carregar clubs da API
  useEffect(() => {
    loadClubs()
  }, [])

  const loadClubs = async () => {
    setIsLoadingClubs(true)
    try {
      const clubsData = await clubService.getAllClubs()
      setClubs(clubsData)
    } catch (error) {
      console.error('Erro ao carregar clubs:', error)
      alert('Erro ao carregar clubs. Verifique se o servidor está rodando.')
    } finally {
      setIsLoadingClubs(false)
    }
  }

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }
  
  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  // Mock data for users
  const [users] = useState<User[]>([
    { id: '1', name: 'John Silva', email: 'john@email.com', membershipStatus: 'active', joinDate: '2024-01-15' },
    { id: '2', name: 'Maria Santos', email: 'maria@email.com', membershipStatus: 'active', joinDate: '2024-02-20' },
    { id: '3', name: 'Peter Costa', email: 'peter@email.com', membershipStatus: 'pending', joinDate: '2024-03-10' },
    { id: '4', name: 'Ana Oliveira', email: 'ana@email.com', membershipStatus: 'inactive', joinDate: '2024-01-05' },
  ])
  
  // Clubs data - carregado da API
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoadingClubs, setIsLoadingClubs] = useState(false)

  // Create Club Form State
  const [clubForm, setClubForm] = useState({
    name: '',
    description: '',
    category: '',
    maxMembers: '',
    membershipFee: '',
    location: '',
    requirements: ''
  })

  const handleClubFormChange = (field: string, value: string) => {
    setClubForm(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Preparar dados do club
      const clubData: CreateClubData = {
        name: clubForm.name,
        description: clubForm.description,
        category: clubForm.category,
        maxMembers: clubForm.maxMembers ? parseInt(clubForm.maxMembers) : undefined,
        membershipFee: clubForm.membershipFee ? parseFloat(clubForm.membershipFee) : undefined,
        location: clubForm.location,
        requirements: clubForm.requirements
      }
      
      // Criar club via API
      const newClub = await clubService.createClub(clubData)
      
      // Atualizar lista local
      setClubs(prev => [...prev, newClub])
      
      // Reset form after submission
      setClubForm({
        name: '',
        description: '',
        category: '',
        maxMembers: '',
        membershipFee: '',
        location: '',
        requirements: ''
      })
      
      // Switch to clubs tab to show the new club
      setActiveTab('clubs')
      
      alert('Club criado com sucesso! Redirecionando para lista de clubs...')
    } catch (error) {
      console.error('Erro ao criar club:', error)
      alert('Erro ao criar club. Tente novamente.')
    }
  }

  const handleRemoveClub = async (clubId: string) => {
    if (!confirm('Tem certeza que deseja remover este club?')) {
      return
    }
    
    try {
      await clubService.deleteClub(clubId)
      setClubs(prev => prev.filter(club => club.id !== clubId))
      alert('Club removido com sucesso!')
    } catch (error) {
      console.error('Erro ao remover club:', error)
      alert('Erro ao remover club. Tente novamente.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/30'
      case 'inactive': return 'text-gray-400 bg-gray-900/30'
      case 'pending': return 'text-yellow-400 bg-yellow-900/30'
      default: return 'text-gray-400 bg-gray-900/30'
    }
  }

  return (
    <div className="min-h-screen bg-premium-dark text-white overflow-hidden pt-20">
      {/* Premium Floating Particles */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-premium-gold rounded-full animate-pulse opacity-60" />
        <div className="absolute top-40 right-20 w-1 h-1 bg-premium-gold rounded-full animate-pulse opacity-40" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-premium-gold rounded-full animate-pulse opacity-50" style={{animationDelay: '2s'}} />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-premium-gold rounded-full animate-pulse opacity-30" style={{animationDelay: '3s'}} />
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-premium-gold rounded-full animate-pulse opacity-70" style={{animationDelay: '4s'}} />
      </div>
      
      {/* Premium Admin Header */}
      <header className="relative z-10 bg-gradient-to-r from-premium-dark via-slate-900 to-premium-dark border-b border-premium-gold/20 px-6 py-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo e Título Premium */}
          <div className="flex items-center space-x-4">
            <img 
              src="/capys-logo.jpeg" 
              alt="Capys Club" 
              className="h-16 filter brightness-0 invert"
            />
            <span className="premium-title text-2xl">- Admin</span>
            <span className="px-4 py-2 bg-premium-gold/20 text-premium-gold text-sm font-semibold rounded-full border border-premium-gold/30">
              ADMIN
            </span>
          </div>

          {/* Centralized Navigation */}
          <div className="flex items-center justify-center flex-1">
            <nav className="flex items-center space-x-6">
              <Button 
                onClick={() => router.push('/')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 text-sm rounded-lg transition-colors duration-200 font-medium"
              >
                Home
              </Button>
              <Button 
                onClick={() => router.push(isDemoMode ? '/dashboard?demo=true' : '/dashboard')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 text-sm rounded-lg transition-colors duration-200 font-medium"
              >
                Dashboard
              </Button>
              <Button 
                className="bg-yellow-600 text-white px-3 py-1 text-sm rounded-lg font-medium cursor-default"
                disabled
              >
                Admin
              </Button>
            </nav>
          </div>

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
      </header>

      {/* Premium Main Content */}
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Premium Page Title */}
          <div className="flex items-center justify-between">
            <h2 className="premium-title text-3xl uppercase font-black">
              Painel Administrativo
            </h2>
            <div className="premium-subtitle text-sm">
              Gerencie usuários, clubs e análises da plataforma
            </div>
          </div>

        {/* Premium Navigation Buttons */}
        <div className="flex gap-3 mb-8">
          <button 
            className={`px-6 py-3 font-medium rounded-full transition-all duration-300 ${
              activeTab === 'users' 
                ? 'bg-premium-gold text-premium-dark shadow-lg shadow-premium-gold/20' 
                : 'bg-slate-800/50 text-gray-300 hover:bg-premium-gold/20 hover:text-premium-gold border border-premium-gold/20'
            }`}
            onClick={() => setActiveTab('users')}
          >
            👥 Usuários
          </button>
          <button 
            className={`px-6 py-3 font-medium rounded-full transition-all duration-300 ${
              activeTab === 'clubs' 
                ? 'bg-premium-gold text-premium-dark shadow-lg shadow-premium-gold/20' 
                : 'bg-slate-800/50 text-gray-300 hover:bg-premium-gold/20 hover:text-premium-gold border border-premium-gold/20'
            }`}
            onClick={() => setActiveTab('clubs')}
          >
            🏛️ Clubs
          </button>
          <button 
            className={`px-6 py-3 font-medium rounded-full transition-all duration-300 ${
              activeTab === 'create-club' 
                ? 'bg-premium-gold text-premium-dark shadow-lg shadow-premium-gold/20' 
                : 'bg-slate-800/50 text-gray-300 hover:bg-premium-gold/20 hover:text-premium-gold border border-premium-gold/20'
            }`}
            onClick={() => setActiveTab('create-club')}
          >
            Criar Club
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-impact font-black text-white uppercase">Manage Users</h2>
              <div className="text-sm text-gray-400">
                Total: {users.length} users
              </div>
            </div>
            
            {/* Analytics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Active Users</h3>
                <p className="text-2xl font-bold text-green-400">{users.filter(u => u.membershipStatus === 'active').length}</p>
                <p className="text-sm text-gray-400 mt-1">Confirmed members</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Pending</h3>
                <p className="text-2xl font-bold text-yellow-400">{users.filter(u => u.membershipStatus === 'pending').length}</p>
                <p className="text-sm text-gray-400 mt-1">Awaiting approval</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Inactive</h3>
                <p className="text-2xl font-bold text-gray-400">{users.filter(u => u.membershipStatus === 'inactive').length}</p>
                <p className="text-sm text-gray-400 mt-1">Suspended members</p>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/5">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/4">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/6">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/6">Join Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700/50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{user.name}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.membershipStatus)}`}>
                          {user.membershipStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(user.joinDate)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-yellow-400 hover:text-yellow-300 mr-2">Edit</button>
                        <button className="text-gray-400 hover:text-gray-300">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Clubs Tab */}
        {activeTab === 'clubs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-impact font-black text-white uppercase">Manage Clubs</h2>
              <div className="text-sm text-gray-400">
                Total: {clubs.length} clubs {isLoadingClubs && '(Carregando...)'}
              </div>
            </div>
            
            {/* Analytics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Total Members</h3>
                <p className="text-2xl font-bold text-blue-400">{clubs.reduce((acc, club) => acc + club.members, 0)}</p>
                <p className="text-sm text-gray-400 mt-1">Across all groups</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Number of Groups</h3>
                <p className="text-2xl font-bold text-green-400">{clubs.length}</p>
                <p className="text-sm text-gray-400 mt-1">Groups created</p>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Club Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Members</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fee (USD)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Creation Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {clubs.map((club) => (
                      <tr key={club.id} className="hover:bg-gray-700/50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">
                          <div>
                            <div className="font-medium">{club.name}</div>
                            {club.description && (
                              <div className="text-xs text-gray-400 mt-1 truncate max-w-xs" title={club.description}>
                                {club.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {club.category ? (
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-900/30 text-blue-400 rounded-full">
                              {club.category}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {club.location || <span className="text-gray-500">-</span>}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div>
                            <div>{club.members}</div>
                            {club.maxMembers && (
                              <div className="text-xs text-gray-500">/ {club.maxMembers} max</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {club.membershipFee ? (
                            <span className="font-medium">${club.membershipFee}</span>
                          ) : (
                            <span className="text-green-400">Free</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(club.status)}`}>
                            {club.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(club.createdDate)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-yellow-400 hover:text-yellow-300 mr-2">Edit</button>
                          <button 
                            className="text-gray-400 hover:text-gray-300"
                            onClick={() => handleRemoveClub(club.id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Create Club Tab */}
        {activeTab === 'create-club' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-impact font-black text-white uppercase">Create New Club</h2>
              <div className="text-sm text-gray-400">
                Fill in the details to create a new club
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <form onSubmit={handleCreateClub} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Club Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Club Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={clubForm.name}
                      onChange={(e) => handleClubFormChange('name', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter club name"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={clubForm.category}
                      onChange={(e) => handleClubFormChange('category', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      <option value="yacht">Yacht Club</option>
                      <option value="sailing">Sailing Club</option>
                      <option value="fishing">Fishing Club</option>
                      <option value="cruising">Cruising Club</option>
                      <option value="racing">Racing Club</option>
                      <option value="social">Social Club</option>
                    </select>
                  </div>

                  {/* Max Members */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Maximum Members
                    </label>
                    <input
                      type="number"
                      value={clubForm.maxMembers}
                      onChange={(e) => handleClubFormChange('maxMembers', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter maximum number of members"
                      min="1"
                    />
                  </div>

                  {/* Membership Fee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Membership Fee (USD)
                    </label>
                    <input
                      type="number"
                      value={clubForm.membershipFee}
                      onChange={(e) => handleClubFormChange('membershipFee', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter membership fee"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Location */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={clubForm.location}
                      onChange={(e) => handleClubFormChange('location', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter club location (city, country)"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={clubForm.description}
                    onChange={(e) => handleClubFormChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter club description"
                  />
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Membership Requirements
                  </label>
                  <textarea
                    value={clubForm.requirements}
                    onChange={(e) => handleClubFormChange('requirements', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter any specific requirements for membership"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setClubForm({
                      name: '',
                      description: '',
                      category: '',
                      maxMembers: '',
                      membershipFee: '',
                      location: '',
                      requirements: ''
                    })}
                    className="px-6 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Clear Form
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    Create Club
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  )
}

export default function AdminPanel() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminPanelContent />
    </Suspense>
  )
}
