'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/lib/WalletProvider'
import { useHeader } from '@/lib/HeaderProvider'
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
  const { hideHeader, showHeader } = useHeader()

  useEffect(() => {
    // Hide global header when entering admin page
    hideHeader()
    
    // Show header again when leaving the page
    return () => {
      showHeader()
    }
  }, [hideHeader, showHeader])

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
  
  // Mock data for clubs
  const [clubs] = useState<Club[]>([
    { id: '1', name: 'Yacht Owners Club', members: 128, status: 'active', createdDate: '2023-12-01' },
    { id: '2', name: 'Sailing Enthusiasts', members: 256, status: 'active', createdDate: '2023-11-15' },
    { id: '3', name: 'Mediterranean Cruisers', members: 89, status: 'active', createdDate: '2024-01-20' },
    { id: '4', name: 'Ocean Explorers', members: 45, status: 'inactive', createdDate: '2024-02-10' },
  ])

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

  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log('Creating club:', clubForm)
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
    alert('Club created successfully!')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/30'
      case 'inactive': return 'text-red-400 bg-red-900/30'
      case 'pending': return 'text-yellow-400 bg-yellow-900/30'
      default: return 'text-gray-400 bg-gray-900/30'
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pt-20">
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
              Administrative Panel
            </h2>
            <div className="text-sm text-gray-400">
              Manage users, clubs and platform analytics
            </div>
          </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-700">
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'users' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'clubs' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('clubs')}
          >
            Clubs
          </button>
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'create-club' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('create-club')}
          >
            Create Club
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Manage Users</h2>
              <div className="text-sm text-gray-400">
                Total: {users.length} users
              </div>
            </div>
            
            {/* Analytics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Active Users</h3>
                <p className="text-3xl font-bold text-green-400">{users.filter(u => u.membershipStatus === 'active').length}</p>
                <p className="text-sm text-gray-400 mt-1">Confirmed members</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Pending</h3>
                <p className="text-3xl font-bold text-yellow-400">{users.filter(u => u.membershipStatus === 'pending').length}</p>
                <p className="text-sm text-gray-400 mt-1">Awaiting approval</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Inactive</h3>
                <p className="text-3xl font-bold text-red-400">{users.filter(u => u.membershipStatus === 'inactive').length}</p>
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
                        <button className="text-blue-400 hover:text-blue-300 mr-2">Edit</button>
                        <button className="text-red-400 hover:text-red-300">Remove</button>
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
              <h2 className="text-2xl font-bold text-white">Manage Clubs</h2>
              <div className="text-sm text-gray-400">
                Total: {clubs.length} clubs
              </div>
            </div>
            
            {/* Analytics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Total Members</h3>
                <p className="text-3xl font-bold text-blue-400">{clubs.reduce((acc, club) => acc + club.members, 0)}</p>
                <p className="text-sm text-gray-400 mt-1">Across all groups</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Number of Groups</h3>
                <p className="text-3xl font-bold text-green-400">{clubs.length}</p>
                <p className="text-sm text-gray-400 mt-1">Groups created</p>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/4">Club Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/6">Members</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/6">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/4">Creation Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {clubs.map((club) => (
                      <tr key={club.id} className="hover:bg-gray-700/50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{club.name}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{club.members}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(club.status)}`}>
                            {club.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(club.createdDate)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-400 hover:text-blue-300 mr-2">Edit</button>
                          <button className="text-red-400 hover:text-red-300">Remove</button>
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
              <h2 className="text-2xl font-bold text-white">Create New Club</h2>
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
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
