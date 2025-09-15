'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/lib/WalletProvider'
import { issueMembership, issueBadge, awardBadge, TransactionStatus } from '@/lib/soroban'
import TransactionStatusComponent from '@/components/TransactionStatus'

export default function Admin() {
  const { isConnected, publicKey, kit } = useWallet()
  
  const [membershipForm, setMembershipForm] = useState({
    walletAddress: ''
  })

  const [badgeForm, setBadgeForm] = useState({
    walletAddress: '',
    badgeId: '',
    badgeName: '',
    badgeDescription: ''
  })

  const [membershipStatus, setMembershipStatus] = useState<TransactionStatus | null>(null)
  const [badgeStatus, setBadgeStatus] = useState<TransactionStatus | null>(null)
  const [isProcessingMembership, setIsProcessingMembership] = useState(false)
  const [isProcessingBadge, setIsProcessingBadge] = useState(false)

  const handleMembershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || !publicKey || !kit) {
      alert('Por favor, conecte sua carteira primeiro')
      return
    }

    if (!membershipForm.walletAddress.trim()) {
      alert('Por favor, insira um endereço de carteira válido')
      return
    }

    setIsProcessingMembership(true)
    setMembershipStatus({
      status: 'pending',
      message: 'Processando emissão de membership...'
    })

    try {
      const result = await issueMembership(membershipForm.walletAddress, publicKey, kit)
      setMembershipStatus(result)
      
      if (result.status === 'success') {
        setMembershipForm({ walletAddress: '' })
      }
    } catch (error) {
      setMembershipStatus({
        status: 'error',
        message: 'Erro inesperado ao processar transação',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setIsProcessingMembership(false)
    }
  }

  const handleBadgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || !publicKey || !kit) {
      alert('Por favor, conecte sua carteira primeiro')
      return
    }

    if (!badgeForm.walletAddress.trim() || !badgeForm.badgeId.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    setIsProcessingBadge(true)
    setBadgeStatus({
      status: 'pending',
      message: 'Processando award de badge...'
    })

    try {
      // Se o fluxo for apenas "award" (conceder um badge já existente no contrato)
      // use a função awardBadge. Se quiser continuar com emissão + award, mantenha issueBadge.
      const result = await awardBadge(badgeForm.walletAddress, badgeForm.badgeId, publicKey, kit)
      setBadgeStatus(result)
      
      if (result.status === 'success') {
        setBadgeForm({ 
          walletAddress: '', 
          badgeId: '', 
          badgeName: '', 
          badgeDescription: '' 
        })
      }
    } catch (error) {
      setBadgeStatus({
        status: 'error',
        message: 'Erro inesperado ao processar transação de award de badge',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setIsProcessingBadge(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Status Notifications */}
        {membershipStatus && (
          <TransactionStatusComponent 
            status={membershipStatus} 
            onClose={() => setMembershipStatus(null)}
          />
        )}
        
        {badgeStatus && (
          <TransactionStatusComponent 
            status={badgeStatus} 
            onClose={() => setBadgeStatus(null)}
          />
        )}

        {/* Connection Status */}
        {!isConnected && (
          <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4">
            <p className="text-yellow-200">
              ⚠️ Você precisa conectar sua carteira para emitir memberships e badges
            </p>
          </div>
        )}

        {/* Issue New Membership Form */}
        <section className="space-y-6">
          <h1 className="text-4xl font-bold text-white mb-8">
            Issue New Membership
          </h1>
          
          <form onSubmit={handleMembershipSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="membership-wallet" className="block text-sm font-medium text-gray-300">
                Wallet Address
              </label>
              <input
                type="text"
                id="membership-wallet"
                value={membershipForm.walletAddress}
                onChange={(e) => setMembershipForm({ ...membershipForm, walletAddress: e.target.value })}
                placeholder="Enter wallet address..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isProcessingMembership}
              />
            </div>
            
            <Button 
              type="submit"
              disabled={isProcessingMembership || !isConnected}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {isProcessingMembership ? 'Processing...' : 'Issue Membership'}
            </Button>
          </form>
        </section>

        {/* Award Badge Form */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white mb-8">
            Award Badge
          </h2>
          
          <form onSubmit={handleBadgeSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="badge-wallet" className="block text-sm font-medium text-gray-300">
                Wallet Address
              </label>
              <input
                type="text"
                id="badge-wallet"
                value={badgeForm.walletAddress}
                onChange={(e) => setBadgeForm({ ...badgeForm, walletAddress: e.target.value })}
                placeholder="Enter wallet address..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isProcessingBadge}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="badge-id" className="block text-sm font-medium text-gray-300">
                Badge ID
              </label>
              <input
                type="text"
                id="badge-id"
                value={badgeForm.badgeId}
                onChange={(e) => setBadgeForm({ ...badgeForm, badgeId: e.target.value })}
                placeholder="Enter badge ID..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isProcessingBadge}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="badge-name" className="block text-sm font-medium text-gray-300">
                Badge Name (Optional)
              </label>
              <input
                type="text"
                id="badge-name"
                value={badgeForm.badgeName}
                onChange={(e) => setBadgeForm({ ...badgeForm, badgeName: e.target.value })}
                placeholder="Enter badge name..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isProcessingBadge}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="badge-description" className="block text-sm font-medium text-gray-300">
                Badge Description (Optional)
              </label>
              <textarea
                id="badge-description"
                value={badgeForm.badgeDescription}
                onChange={(e) => setBadgeForm({ ...badgeForm, badgeDescription: e.target.value })}
                placeholder="Enter badge description..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isProcessingBadge}
              />
            </div>
            
            <Button 
              type="submit"
              disabled={isProcessingBadge || !isConnected}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {isProcessingBadge ? 'Processing...' : 'Award Badge'}
            </Button>
          </form>
        </section>

      </div>
    </div>
  )
}
