import { TransactionStatus as TransactionStatusType } from '@/lib/soroban'

interface TransactionStatusProps {
  status: TransactionStatusType
  onClose?: () => void
}

export default function TransactionStatus({ status, onClose }: TransactionStatusProps) {
  const getStatusIcon = () => {
    switch (status.status) {
      case 'pending':
        return (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        )
      case 'success':
        return (
          <div className="rounded-full h-6 w-6 bg-green-500 flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="rounded-full h-6 w-6 bg-gray-500 flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )
    }
  }

  const getStatusColor = () => {
    switch (status.status) {
      case 'pending':
        return 'border-yellow-500 bg-yellow-50 text-yellow-800'
      case 'success':
        return 'border-green-500 bg-green-50 text-green-800'
      case 'error':
        return 'border-gray-500 bg-gray-50 text-gray-800'
    }
  }

  const getStatusText = () => {
    switch (status.status) {
      case 'pending':
        return 'Processando transação...'
      case 'success':
        return 'Transação confirmada!'
      case 'error':
        return 'Erro na transação'
    }
  }

  return (
    <div className={`fixed top-20 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 ${getStatusColor()}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getStatusIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium">
              {getStatusText()}
            </p>
            <p className="mt-1 text-sm">
              {status.message}
            </p>
            {status.transactionHash && (
              <p className="mt-2 text-xs font-mono break-all">
                Hash: {status.transactionHash}
              </p>
            )}
            {status.error && (
              <p className="mt-2 text-xs text-gray-600">
                Erro: {status.error}
              </p>
            )}
          </div>
          {onClose && (
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={onClose}
                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="sr-only">Fechar</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


