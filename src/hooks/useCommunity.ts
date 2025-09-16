import { useContext } from 'react';
import CommunityContext from '@/contexts/CommunityContext';
import { CommunityContextType } from '@/types/community';

/**
 * Hook personalizado para acessar o contexto de comunidades
 * 
 * @returns {CommunityContextType} Contexto de comunidades com estado e funções
 * @throws {Error} Se usado fora do CommunityProvider
 */
export function useCommunity(): CommunityContextType {
  const context = useContext(CommunityContext);
  
  if (context === undefined) {
    throw new Error('useCommunity deve ser usado dentro de um CommunityProvider');
  }
  
  return context;
}

export default useCommunity;