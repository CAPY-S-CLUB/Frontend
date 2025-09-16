import { useContext } from 'react';
import AuthContext from '@/contexts/AuthContext';
import { AuthContextType } from '@/types/auth';

/**
 * Hook personalizado para acessar o contexto de autenticação
 * 
 * @returns {AuthContextType} Contexto de autenticação com estado e funções
 * @throws {Error} Se usado fora do AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}

export default useAuth;