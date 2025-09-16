'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log do erro para monitoramento
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);

    // Callback personalizado para tratamento de erro
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Em produção, você pode enviar o erro para um serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      // Exemplo: Sentry.captureException(error);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Renderizar fallback personalizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback padrão
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-gray-500" />
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Oops! Algo deu errado
            </h1>
            
            <p className="text-gray-600 mb-6">
              Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver o problema.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Detalhes do erro (desenvolvimento)
                </summary>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Erro:</strong> {this.state.error.message}
                  </div>
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Recarregar página
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Se o problema persistir, entre em contato com o suporte.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Hook para capturar erros em componentes funcionais
export function useErrorHandler() {
  const handleError = (error: Error, errorInfo?: any) => {
    console.error('Erro capturado:', error, errorInfo);
    
    // Em produção, enviar para serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      // Exemplo: Sentry.captureException(error);
    }
  };

  return handleError;
}

// Componente de erro para páginas específicas
export function PageError({ 
  title = 'Página não encontrada',
  message = 'A página que você está procurando não existe ou foi movida.',
  showRetry = false,
  onRetry
}: {
  title?: string;
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-16 w-16 text-gray-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Voltar
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
          >
            Ir para início
          </button>
          
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}