import { AxiosError } from 'axios';

// Tipos de erro personalizados
export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends Error {
  public field?: string;
  public value?: any;

  constructor(message: string, field?: string, value?: any) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Erro de conexão com o servidor') {
    super(message, 0);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Erro de autenticação') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Acesso negado') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

// Mapeamento de códigos de status HTTP para mensagens amigáveis
const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: 'Dados inválidos fornecidos',
  401: 'Você precisa fazer login para acessar este recurso',
  403: 'Você não tem permissão para acessar este recurso',
  404: 'Recurso não encontrado',
  409: 'Conflito: o recurso já existe ou está em uso',
  422: 'Dados fornecidos são inválidos',
  429: 'Muitas tentativas. Tente novamente em alguns minutos',
  500: 'Erro interno do servidor. Tente novamente mais tarde',
  502: 'Servidor temporariamente indisponível',
  503: 'Serviço temporariamente indisponível',
  504: 'Tempo limite de conexão excedido',
};

// Função principal para tratar erros de API
export function handleApiError(error: unknown): ApiError {
  // Se já é um ApiError, retorna como está
  if (error instanceof ApiError) {
    return error;
  }

  // Se é um erro do Axios
  if (error instanceof AxiosError) {
    const status = error.response?.status || 0;
    const responseData = error.response?.data;
    
    // Mensagem do servidor ou mensagem padrão
    let message = responseData?.message || 
                  responseData?.error || 
                  HTTP_STATUS_MESSAGES[status] || 
                  'Erro desconhecido do servidor';

    // Código de erro específico
    const code = responseData?.code || responseData?.error_code;
    
    // Detalhes adicionais (como erros de validação)
    const details = responseData?.details || responseData?.errors;

    // Tratar casos específicos
    switch (status) {
      case 401:
        return new AuthenticationError(message);
      case 403:
        return new AuthorizationError(message);
      case 0:
        return new NetworkError('Não foi possível conectar ao servidor');
      default:
        return new ApiError(message, status, code, details);
    }
  }

  // Se é um erro de rede
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError();
  }

  // Se é um erro genérico
  if (error instanceof Error) {
    return new ApiError(error.message, 0);
  }

  // Fallback para erros desconhecidos
  return new ApiError('Erro desconhecido', 0);
}

// Função para obter mensagem amigável do erro
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof ValidationError) {
    return error.message;
  }
  
  if (error instanceof NetworkError) {
    return error.message;
  }
  
  if (error instanceof AuthenticationError) {
    return error.message;
  }
  
  if (error instanceof AuthorizationError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Erro desconhecido';
}

// Função para verificar se o erro é de autenticação
export function isAuthError(error: unknown): boolean {
  return error instanceof AuthenticationError || 
         (error instanceof ApiError && error.status === 401);
}

// Função para verificar se o erro é de autorização
export function isAuthorizationError(error: unknown): boolean {
  return error instanceof AuthorizationError || 
         (error instanceof ApiError && error.status === 403);
}

// Função para verificar se o erro é de rede
export function isNetworkError(error: unknown): boolean {
  return error instanceof NetworkError || 
         (error instanceof ApiError && error.status === 0);
}

// Função para verificar se o erro é de validação
export function isValidationError(error: unknown): boolean {
  return error instanceof ValidationError || 
         (error instanceof ApiError && (error.status === 400 || error.status === 422));
}

// Função para retry automático baseado no tipo de erro
export function shouldRetry(error: unknown, attempt: number, maxAttempts: number = 3): boolean {
  if (attempt >= maxAttempts) {
    return false;
  }

  // Retry para erros de rede
  if (isNetworkError(error)) {
    return true;
  }

  // Retry para erros de servidor (5xx)
  if (error instanceof ApiError && error.status >= 500) {
    return true;
  }

  // Retry para timeout
  if (error instanceof ApiError && error.status === 504) {
    return true;
  }

  return false;
}

// Função para calcular delay de retry (exponential backoff)
export function getRetryDelay(attempt: number, baseDelay: number = 1000): number {
  return Math.min(baseDelay * Math.pow(2, attempt), 10000); // Max 10 segundos
}

// Função para validar dados de entrada
export function validateRequired(value: any, fieldName: string): void {
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(`${fieldName} é obrigatório`, fieldName, value);
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Email inválido', 'email', email);
  }
}

export function validatePassword(password: string): void {
  if (password.length < 8) {
    throw new ValidationError('Senha deve ter pelo menos 8 caracteres', 'password');
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    throw new ValidationError(
      'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
      'password'
    );
  }
}

export function validateUrl(url: string): void {
  try {
    new URL(url);
  } catch {
    throw new ValidationError('URL inválida', 'url', url);
  }
}

// Função para log de erros (pode ser integrada com serviços de monitoramento)
export function logError(error: unknown, context?: string): void {
  const errorInfo = {
    message: getErrorMessage(error),
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server',
  };

  // Log no console em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorInfo, error);
  }

  // Em produção, enviar para serviço de monitoramento
  if (process.env.NODE_ENV === 'production') {
    // Exemplo: Sentry.captureException(error, { extra: errorInfo });
    // Exemplo: analytics.track('Error', errorInfo);
  }
}

// Wrapper para funções assíncronas com tratamento de erro
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, context);
      throw handleApiError(error);
    }
  };
}

// Função para criar toast de erro (pode ser integrada com biblioteca de toast)
export function showErrorToast(error: unknown): void {
  const message = getErrorMessage(error);
  
  // Aqui você pode integrar com sua biblioteca de toast preferida
  // Exemplo: toast.error(message);
  console.error('Toast Error:', message);
}

// Função para criar notificação de sucesso
export function showSuccessToast(message: string): void {
  // Aqui você pode integrar com sua biblioteca de toast preferida
  // Exemplo: toast.success(message);
  console.log('Toast Success:', message);
}