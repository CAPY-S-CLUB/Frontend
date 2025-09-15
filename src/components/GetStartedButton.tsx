'use client'

import { useRouter } from 'next/navigation'
import { Button } from './ui/button'

type GetStartedButtonProps = {
  className?: string
}

export default function GetStartedButton({ className }: GetStartedButtonProps) {
  const router = useRouter()

  const handleGetStarted = () => {
    console.log('Get Started button clicked!')
    alert('Navegando para login...')
    router.push('/login')
  }

  return (
    <Button
      onClick={handleGetStarted}
      className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 ${className ?? ''}`}
    >
      Get Started
    </Button>
  )
}