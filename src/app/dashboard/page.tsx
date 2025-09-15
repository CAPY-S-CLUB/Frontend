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
              Your wallet: <span className="text-blue-400 font-mono">{publicKey?.slice(0, 8)}...{publicKey?.slice(-8)}</span>
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
        <h1 className="text-4xl font-bold text-white">
          Dashboard
        </h1>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-700">
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'membership' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('membership')}
          >
            Membership
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'clubs' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('clubs')}
          >
            My Clubs
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'discover' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('discover')}
          >
            Discover
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'admin' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
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
                        target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${publicKey}&backgroundColor=1f2937&textColor=ffffff`
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
                            badge.rarity === 'Rare' ? 'bg-blue-600 text-blue-200' :
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
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏛️</div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Clubs Joined Yet</h3>
              <p className="text-gray-500">Join clubs to connect with like-minded members!</p>
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

      </div>
    </div>
  )
}
