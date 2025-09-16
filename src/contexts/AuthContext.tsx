'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authService } from '@/lib/authService';
import {
  AuthState,
  AuthContextType,
  LoginCredentials,
  RegisterCredentials,
  User,
} from '@/types/auth';

// Estado inicial
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Tipos de ações
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    default:
      return state;
  }
}

// Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar autenticação ao carregar a aplicação
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        if (authService.isAuthenticated()) {
          const user = await authService.getCurrentUser();
          
          if (user) {
            dispatch({ type: 'AUTH_SUCCESS', payload: user });
          } else {
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        dispatch({ type: 'AUTH_LOGOUT' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Função de login
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authService.login(credentials);
      
      if (response.success) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data.user });
      } else {
        throw new Error(response.message || 'Erro ao fazer login');
      }
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função de registro
  const register = async (credentials: RegisterCredentials): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authService.register(credentials);
      
      if (response.success) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data.user });
      } else {
        throw new Error(response.message || 'Erro ao criar conta');
      }
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função de logout
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Função para renovar token
  const refreshToken = async (): Promise<void> => {
    try {
      const newToken = await authService.refreshAccessToken();
      
      if (!newToken) {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Função para limpar erro
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}

export default AuthContext;