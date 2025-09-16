import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig, CancelToken } from 'axios';
import { handleApiError, logError, showErrorToast } from './errorHandler';


// Configuração dos interceptadores de requisição
export function setupRequestInterceptors() {
  // Interceptador para adicionar token de autenticação
  axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {


      // Adicionar headers padrão
      config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
      config.headers['Accept'] = 'application/json';

      // Log da requisição em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
          headers: config.headers,
        });
      }

      return config;
    },
    (error: AxiosError) => {
      logError(error, 'Request Interceptor');
      return Promise.reject(handleApiError(error));
    }
  );
}

// Configuração dos interceptadores de resposta
export function setupResponseInterceptors() {
  // Interceptador para tratar respostas e erros
  axios.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log da resposta em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ API Response:', {
          status: response.status,
          url: response.config.url,
          data: response.data,
        });
      }

      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Log do erro em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ API Error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data,
        });
      }

      // Tratar erro 401 (não autorizado)
      if (error.response?.status === 401) {
        showErrorToast('Acesso não autorizado');
      }

      // Tratar erro 403 (acesso negado)
      if (error.response?.status === 403) {
        showErrorToast('Você não tem permissão para acessar este recurso');
      }

      // Tratar erro 404 (não encontrado)
      if (error.response?.status === 404) {
        showErrorToast('Recurso não encontrado');
      }

      // Tratar erro 429 (muitas requisições)
      if (error.response?.status === 429) {
        showErrorToast('Muitas tentativas. Tente novamente em alguns minutos');
      }

      // Tratar erros de servidor (5xx)
      if (error.response?.status && error.response.status >= 500) {
        showErrorToast('Erro interno do servidor. Tente novamente mais tarde');
      }

      // Tratar erro de rede
      if (!error.response) {
        showErrorToast('Erro de conexão. Verifique sua internet');
      }

      // Log do erro para monitoramento
      logError(error, 'Response Interceptor');

      return Promise.reject(handleApiError(error));
    }
  );
}

// Função para configurar timeout padrão
export function setupDefaultTimeout(timeout: number = 30000) {
  axios.defaults.timeout = timeout;
}

// Função para configurar base URL
export function setupBaseURL(baseURL: string) {
  axios.defaults.baseURL = baseURL;
}

// Função para configurar todos os interceptadores
export function setupApiInterceptors() {
  setupRequestInterceptors();
  setupResponseInterceptors();
  setupDefaultTimeout();
  
  // Configurar base URL a partir das variáveis de ambiente
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  setupBaseURL(baseURL);

  console.log('🔧 API Interceptors configured with base URL:', baseURL);
}

// Função para limpar interceptadores (útil para testes)
export function clearApiInterceptors() {
  axios.interceptors.request.clear();
  axios.interceptors.response.clear();
}

// Função para criar instância personalizada do axios
export function createApiInstance(config?: {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}) {
  const instance = axios.create({
    baseURL: config?.baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    timeout: config?.timeout || 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...config?.headers,
    },
  });

  // Aplicar interceptadores na instância personalizada
  instance.interceptors.request.use(
    (requestConfig: InternalAxiosRequestConfig) => {
      return requestConfig;
    },
    (error: AxiosError) => {
      return Promise.reject(handleApiError(error));
    }
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      logError(error, 'Custom API Instance');
      return Promise.reject(handleApiError(error));
    }
  );

  return instance;
}

// Função para retry automático
export function createRetryableRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
) {
  return async (): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        // Não fazer retry no último attempt
        if (attempt === maxRetries) {
          break;
        }
        
        // Verificar se deve fazer retry
        const apiError = handleApiError(error);
        if (apiError.status && apiError.status >= 400 && apiError.status < 500) {
          // Não fazer retry para erros de cliente (4xx)
          break;
        }
        
        // Calcular delay com exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.log(`🔄 Retrying request (attempt ${attempt + 1}/${maxRetries})`);
      }
    }
    
    throw lastError;
  };
}

// Função para cancelar requisições
export function createCancelableRequest<T>(
  requestFn: (cancelToken: CancelToken) => Promise<T>
) {
  const source = axios.CancelToken.source();
  
  const request = requestFn(source.token);
  
  return {
    request,
    cancel: (message?: string) => {
      source.cancel(message || 'Request canceled');
    },
  };
}

// Função para fazer upload com progresso
export function createUploadRequest(
  url: string,
  file: File,
  onProgress?: (progress: number) => void
) {
  const formData = new FormData();
  formData.append('file', file);
  
  return axios.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
}

// Função para fazer download com progresso
export function createDownloadRequest(
  url: string,
  onProgress?: (progress: number) => void
) {
  return axios.get(url, {
    responseType: 'blob',
    onDownloadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
}