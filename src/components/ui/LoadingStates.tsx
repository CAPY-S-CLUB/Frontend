'use client'

import React from 'react'
import { Loader2, CheckCircle, XCircle, AlertCircle, Wallet, Network } from 'lucide-react'

// Tipos de loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error' | 'warning'

// Interface para props do componente de loading
interface LoadingProps {
  state: LoadingState
  message?: string
  progress?: number
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Interface para feedback de transação
interface TransactionFeedbackProps {
  state: LoadingState
  transactionHash?: string
  message: string
  onRetry?: () => void
  onClose?: () => void
}

// Componente de loading básico
export function LoadingSpinner({ 
  state, 
  message, 
  progress, 
  showIcon = true, 
  size = 'md',
  className = '' 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }
  
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }
  
  const getIcon = () => {
    switch (state) {
      case 'loading':
        return <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />
      case 'success':
        return <CheckCircle className={`${sizeClasses[size]} text-green-500`} />
      case 'error':
        return <XCircle className={`${sizeClasses[size]} text-red-500`} />
      case 'warning':
        return <AlertCircle className={`${sizeClasses[size]} text-yellow-500`} />
      default:
        return null
    }
  }
  
  const getStateColor = () => {
    switch (state) {
      case 'loading':
        return 'text-blue-600'
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showIcon && getIcon()}
      {message && (
        <span className={`${textSizeClasses[size]} ${getStateColor()}`}>
          {message}
        </span>
      )}
      {progress !== undefined && (
        <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  )
}

// Componente de feedback para transações blockchain
export function TransactionFeedback({
  state,
  transactionHash,
  message,
  onRetry,
  onClose
}: TransactionFeedbackProps) {
  const getBackgroundColor = () => {
    switch (state) {
      case 'loading':
        return 'bg-blue-50 border-blue-200'
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }
  
  return (
    <div className={`p-4 rounded-lg border ${getBackgroundColor()}`}>
      <div className="flex items-start space-x-3">
        <LoadingSpinner state={state} showIcon={true} size="md" />
        <div className="flex-1">
          <p className="font-medium text-gray-900">{message}</p>
          {transactionHash && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Hash da transação:</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono break-all">
                {transactionHash}
              </code>
            </div>
          )}
          <div className="mt-3 flex space-x-2">
            {onRetry && state === 'error' && (
              <button
                onClick={onRetry}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Tentar Novamente
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Fechar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de loading para operações de carteira
export function WalletLoadingState({ 
  state, 
  message, 
  walletType 
}: { 
  state: LoadingState
  message: string
  walletType?: string 
}) {
  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      <div className="relative">
        <Wallet className="w-12 h-12 text-blue-500" />
        {state === 'loading' && (
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 absolute -top-1 -right-1" />
        )}
      </div>
      <div className="text-center">
        <p className="font-medium text-gray-900">{message}</p>
        {walletType && (
          <p className="text-sm text-gray-600 mt-1">Carteira: {walletType}</p>
        )}
      </div>
    </div>
  )
}

// Componente de loading para operações de rede
export function NetworkLoadingState({ 
  state, 
  message, 
  networkName 
}: { 
  state: LoadingState
  message: string
  networkName?: string 
}) {
  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      <div className="relative">
        <Network className="w-12 h-12 text-green-500" />
        {state === 'loading' && (
          <Loader2 className="w-6 h-6 animate-spin text-green-500 absolute -top-1 -right-1" />
        )}
      </div>
      <div className="text-center">
        <p className="font-medium text-gray-900">{message}</p>
        {networkName && (
          <p className="text-sm text-gray-600 mt-1">Rede: {networkName}</p>
        )}
      </div>
    </div>
  )
}

// Hook para gerenciar estados de loading
export function useLoadingState(initialState: LoadingState = 'idle') {
  const [state, setState] = React.useState<LoadingState>(initialState)
  const [message, setMessage] = React.useState<string>('')
  const [progress, setProgress] = React.useState<number | undefined>(undefined)
  
  const setLoading = (msg: string, prog?: number) => {
    setState('loading')
    setMessage(msg)
    setProgress(prog)
  }
  
  const setSuccess = (msg: string) => {
    setState('success')
    setMessage(msg)
    setProgress(undefined)
  }
  
  const setError = (msg: string) => {
    setState('error')
    setMessage(msg)
    setProgress(undefined)
  }
  
  const setWarning = (msg: string) => {
    setState('warning')
    setMessage(msg)
    setProgress(undefined)
  }
  
  const reset = () => {
    setState('idle')
    setMessage('')
    setProgress(undefined)
  }
  
  return {
    state,
    message,
    progress,
    setLoading,
    setSuccess,
    setError,
    setWarning,
    reset
  }
}

// Componente de progresso para múltiplas etapas
interface StepProgressProps {
  steps: Array<{
    id: string
    label: string
    state: LoadingState
  }>
  currentStep?: string
}

export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep
        const isCompleted = step.state === 'success'
        const hasError = step.state === 'error'
        
        return (
          <div key={step.id} className="flex items-center space-x-3">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${isCompleted ? 'bg-green-500 text-white' : ''}
              ${hasError ? 'bg-red-500 text-white' : ''}
              ${isActive && !isCompleted && !hasError ? 'bg-blue-500 text-white' : ''}
              ${!isActive && !isCompleted && !hasError ? 'bg-gray-200 text-gray-600' : ''}
            `}>
              {isCompleted ? (
                <CheckCircle className="w-4 h-4" />
              ) : hasError ? (
                <XCircle className="w-4 h-4" />
              ) : isActive ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                index + 1
              )}
            </div>
            <span className={`
              ${isActive ? 'font-medium text-gray-900' : 'text-gray-600'}
              ${hasError ? 'text-red-600' : ''}
              ${isCompleted ? 'text-green-600' : ''}
            `}>
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}