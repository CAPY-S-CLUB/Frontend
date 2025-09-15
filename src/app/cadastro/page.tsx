'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CadastroPage() {
  const router = useRouter()
  const [showOptions, setShowOptions] = useState(false)

  const handleGetStarted = () => {
    setShowOptions(true)
  }

  const handleConnectWallet = () => {
    console.log('Connect Wallet clicked!')
    // Implement wallet connection logic
    alert('Connecting wallet...')
  }

  const handleCreateWallet = () => {
    console.log('Create Wallet clicked!')
    // Implement wallet creation logic
    alert('Creating new wallet...')
  }

  const handleBack = () => {
    if (showOptions) {
      setShowOptions(false)
    } else {
      router.push('/')
    }
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
      <div className="relative z-20 flex flex-col items-center justify-center h-full w-full text-center p-4 sm:p-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Welcome to Meridian</h1>
            <p className="text-xl text-gray-300 mb-8">
              {showOptions ? 'Choose how you want to access the platform' : 'The private community for the most discerning yacht owners'}
            </p>
          </div>
          
          {!showOptions ? (
            <div className="space-y-4">
              <Button
                onClick={handleGetStarted}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-4 rounded-lg transition-colors duration-200 text-lg"
              >
                Get Started
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                onClick={handleConnectWallet}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-4 rounded-lg transition-colors duration-200 text-lg"
              >
                Connect Wallet
              </Button>
              
              <Button
                onClick={handleCreateWallet}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
              >
                Create Wallet
              </Button>
            </div>
          )}
          
          <div className="pt-4">
            <Button
              onClick={handleBack}
              className="text-gray-300 hover:text-white underline bg-transparent hover:bg-transparent"
            >
              {showOptions ? 'Back' : 'Back to Home'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}