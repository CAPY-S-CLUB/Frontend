'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/lib/WalletProvider'
import { getUserProfile, NFTMetadata, BadgeMetadata } from '@/lib/stellar'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'

interface UserProfile {
  hasMembership: boolean
  membershipNFT: NFTMetadata | null
  badges: BadgeMetadata[]
  totalBadges: number
}

interface Club {
  id: string
  name: string
  description: string
  members: number
  joined: boolean
}

export default function Dashboard() {
  const { isConnected, publicKey } = useWallet()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDemoMode = searchParams.get('demo') === 'true'
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('membership')
  const [showClubDetails, setShowClubDetails] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [clubs, setClubs] = useState<Club[]>([])

  useEffect(() => {
    const loadUserProfile = async () => {
      // Se estiver em modo demo, criar dados fictícios
      if (isDemoMode) {
        setIsLoading(true)
        // Simular carregamento
        setTimeout(() => {
          setUserProfile({
            hasMembership: true,
            membershipNFT: {
              name: 'Capys Club Membership #1234',
              description: 'Exclusive membership NFT for Capys Club',
              image: 'https://via.placeholder.com/300x300?text=Demo+NFT',
              attributes: []
            },
            badges: [
              {
                name: 'Early Adopter',
                description: 'One of the first members',
                image: 'https://via.placeholder.com/100x100?text=Badge1',
                attributes: []
              },
              {
                name: 'Yacht Owner',
                description: 'Verified yacht owner',
                image: 'https://via.placeholder.com/100x100?text=Badge2',
                attributes: []
              }
            ],
            totalBadges: 2
          })
          setIsLoading(false)
        }, 1000)
        
        // Dados de exemplo para clubes
        setClubs([
          { id: '1', name: 'Yacht Owners Club', description: 'Exclusive club for yacht owners', members: 128, joined: true },
          { id: '2', name: 'Sailing Enthusiasts', description: 'For those who love sailing', members: 256, joined: false },
          { id: '3', name: 'Mediterranean Cruisers', description: 'Cruising the Mediterranean Sea', members: 89, joined: true },
          { id: '4', name: 'Ocean Explorers', description: 'Deep sea exploration and adventures', members: 45, joined: false },
        ])
        return
      }

      if (!isConnected || !publicKey) {
        setUserProfile(null)
        return
      }

      setIsLoading(true)
      try {
        const profile = await getUserProfile(publicKey)
        setUserProfile(profile)
        
        // Dados de exemplo para clubes
        setClubs([
          { id: '1', name: 'Yacht Owners Club', description: 'Exclusive club for yacht owners', members: 128, joined: true },
          { id: '2', name: 'Sailing Enthusiasts', description: 'For those who love sailing', members: 256, joined: false },
          { id: '3', name: 'Mediterranean Cruisers', description: 'Cruising the Mediterranean Sea', members: 89, joined: true },
          { id: '4', name: 'Ocean Explorers', description: 'Deep sea exploration and adventures', members: 45, joined: false },
        ])
      } catch (error) {
        console.error('Erro ao carregar perfil do usuário:', error)
        setUserProfile(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [isConnected, publicKey, isDemoMode])

  // Se não estiver conectado E não estiver em modo demo
  if (!isConnected && !isDemoMode) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-xl text-gray-300">Please connect your wallet to access the dashboard</p>
        </div>
      </div>
    )
  }

  // Se estiver carregando
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your profile..." />
      </div>
    )
  }

  // Se não possui membership E não estiver em modo demo
  if (userProfile && !userProfile.hasMembership && !isDemoMode) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-xl text-gray-300 mb-6">You need a Capys Club membership NFT to access this dashboard</p>
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-sm text-gray-400">
              Your wallet: <span className="text-purple-400 font-mono">{publicKey?.slice(0, 8)}...{publicKey?.slice(-8)}</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Filtrar clubes com base na pesquisa
  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    club.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Função para alternar participação em um clube
  const toggleClubMembership = (clubId: string) => {
    setClubs(clubs.map(club => 
      club.id === clubId ? { ...club, joined: !club.joined } : club
    ))
  }

  // Se possui membership - mostrar dashboard completo
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-white">
            Dashboard
          </h1>
          {isDemoMode && (
            <Button
              onClick={() => router.push('/')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Back to Home
            </Button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-700">
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'membership' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('membership')}
          >
            Membership
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'clubs' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('clubs')}
          >
            My Clubs
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'discover' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('discover')}
          >
            Discover
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'admin' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => router.push(isDemoMode ? '/admin?demo=true' : '/admin')}
          >
            Admin
          </button>
        </div>
        
        {/* Membership Tab Content */}
        {activeTab === 'membership' && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white">
              My Membership Card
            </h2>
            
            {userProfile?.membershipNFT ? (
              <div className="flex justify-center">
                <div className="w-80 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-green-500">
                  <div className="h-64 bg-gray-700 flex items-center justify-center">
                    <img 
                      src={userProfile.membershipNFT.image} 
                      alt={userProfile.membershipNFT.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `https://api.dicebear.com/7.x/big-smile/svg?seed=${publicKey}&backgroundColor=1f2937&textColor=ffffff`
                      }}
                    />
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {userProfile.membershipNFT.name}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                      {userProfile.membershipNFT.description}
                    </p>
                    
                    <div className="space-y-2">
                      {userProfile.membershipNFT.attributes.map((attr, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-400">{attr.trait_type}:</span>
                          <span className="text-white font-semibold">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-64 h-96 border-2 border-gray-600 rounded-lg bg-gray-800 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-6xl mb-4">🖼️</div>
                    <p className="text-lg">Loading NFT...</p>
                  </div>
                </div>
              </div>
            )}

            {/* My Achievements Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white">
                  My Achievements
                </h2>
                <div className="text-sm text-gray-400">
                  {userProfile?.totalBadges || 0} badges earned
                </div>
              </div>
              
              {userProfile?.badges && userProfile.badges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userProfile.badges.map((badge, index) => (
                    <div 
                      key={index}
                      className="group relative bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <div className="h-32 bg-gray-700 flex items-center justify-center">
                        <img 
                          src={badge.image} 
                          alt={badge.name}
                          className="w-20 h-20 object-cover rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${badge.name}&backgroundColor=1f2937&textColor=ffffff`
                          }}
                        />
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-sm font-bold text-white mb-1 truncate">
                          {badge.name}
                        </h3>
                        <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                          {badge.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            badge.rarity === 'Common' ? 'bg-gray-600 text-gray-200' :
                            badge.rarity === 'Rare' ? 'bg-purple-600 text-purple-200' :
                            badge.rarity === 'Epic' ? 'bg-purple-600 text-purple-200' :
                            'bg-yellow-600 text-yellow-200'
                          }`}>
                            {badge.rarity}
                          </span>
                          <span className="text-xs text-gray-500">
                            {badge.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No Achievements Yet</h3>
                  <p className="text-gray-500">Complete tasks and activities to earn your first badge!</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* My Clubs Tab Content */}
        {activeTab === 'clubs' && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white">
              My Clubs
            </h2>
            
            {/* Clubs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Yacht Club Example */}
              <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-700">
                {/* Club Header with Logo */}
                <div className="relative h-32 bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
                    alt="Elite Yacht Club"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = '<div class="text-6xl">⛵</div>'
                      }
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      JOINED
                    </span>
                  </div>
                </div>
                
                {/* Club Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Elite Yacht Club
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    Exclusive community for yacht enthusiasts. Experience luxury sailing, networking events, and premium marina access worldwide.
                  </p>
                  
                  {/* Club Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">247</div>
                        <div className="text-xs text-gray-500">Members</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">12</div>
                        <div className="text-xs text-gray-500">Events</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">★ 4.9</div>
                        <div className="text-xs text-gray-500">Rating</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Club Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-blue-600 text-blue-200 text-xs px-2 py-1 rounded-full">
                      Luxury
                    </span>
                    <span className="bg-purple-600 text-purple-200 text-xs px-2 py-1 rounded-full">
                      Sailing
                    </span>
                    <span className="bg-green-600 text-green-200 text-xs px-2 py-1 rounded-full">
                      Networking
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setShowClubDetails(true)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      View Club
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                      Chat
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Placeholder for more clubs */}
              <div className="bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 flex items-center justify-center h-80">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">+</div>
                  <p className="text-sm">Discover More Clubs</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Discover Tab Content */}
        {activeTab === 'discover' && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white">
              Discover Clubs
            </h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Explore New Communities</h3>
              <p className="text-gray-500">Find clubs that match your interests and passions!</p>
            </div>
          </section>
        )}
        
        {/* Club Details Modal */}
        {showClubDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="relative h-48 bg-gradient-to-br from-blue-900 to-blue-700 rounded-t-xl overflow-hidden">
                <img 
                  src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAGwAAAQUBAQAAAAAAAAAAAAAABgABAgMEBQf/xAAsEAACAQMDAgUEAwEAAAAAAAABAgMABBEFEiExQVEGEyJhcTKBkaGxwdHw/8QAGAEAAwEBAAAAAAAAAAAAAAAAAAECAwT/xAAeEQACAgICAwEAAAAAAAAAAAABAgARAyESMUFRYf/aAAwDAQACEQMRAD8A9mooooAKKKKACiiigAooooAKKKKACiiigD/2Q=="
                  alt="Elite Yacht Club"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30" />
                <button 
                  onClick={() => setShowClubDetails(false)}
                  className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold"
                >
                  ×
                </button>
                <div className="absolute bottom-4 left-6">
                  <h1 className="text-3xl font-bold text-white mb-2">Elite Yacht Club</h1>
                  <div className="flex items-center space-x-4">
                    <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full font-semibold">
                      MEMBER
                    </span>
                    <span className="text-white text-sm">★ 4.9 Rating</span>
                    <span className="text-white text-sm">247 Members</span>
                  </div>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-6">
                {/* Club Description */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4">About the Club</h2>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    The Elite Yacht Club is an exclusive community for yacht enthusiasts and luxury maritime lifestyle aficionados. 
                    Founded in 1985, we offer unparalleled access to premium marinas worldwide, exclusive sailing events, 
                    and networking opportunities with fellow yacht owners and maritime professionals.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    Our members enjoy access to over 200 premium marinas globally, concierge services, 
                    yacht maintenance partnerships, and exclusive social events in the world's most beautiful coastal destinations.
                  </p>
                </div>
                
                {/* Club Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Club Benefits</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Access to 200+ premium marinas</li>
                      <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> 24/7 concierge services</li>
                      <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Exclusive sailing events</li>
                      <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Yacht maintenance partnerships</li>
                      <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Global networking events</li>
                      <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Priority booking at luxury resorts</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Upcoming Events</h3>
                    <div className="space-y-3">
                      <div className="bg-gray-700 p-3 rounded-lg">
                        <h4 className="text-white font-semibold">Monaco Grand Prix Regatta</h4>
                        <p className="text-gray-400 text-sm">May 25-28, 2024 • Monaco</p>
                      </div>
                      <div className="bg-gray-700 p-3 rounded-lg">
                        <h4 className="text-white font-semibold">Caribbean Sailing Championship</h4>
                        <p className="text-gray-400 text-sm">June 15-22, 2024 • Barbados</p>
                      </div>
                      <div className="bg-gray-700 p-3 rounded-lg">
                        <h4 className="text-white font-semibold">Mediterranean Yacht Week</h4>
                        <p className="text-gray-400 text-sm">July 10-17, 2024 • French Riviera</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Club Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-700 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-400">247</div>
                    <div className="text-gray-400 text-sm">Active Members</div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-400">200+</div>
                    <div className="text-gray-400 text-sm">Partner Marinas</div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-400">12</div>
                    <div className="text-gray-400 text-sm">Annual Events</div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-400">39</div>
                    <div className="text-gray-400 text-sm">Years Active</div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                    Join Events
                  </button>
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                    Club Chat
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                    Share Club
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
