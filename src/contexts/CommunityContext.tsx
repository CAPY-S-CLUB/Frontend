'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { communityService } from '@/lib/communityService';
import {
  Community,
  CommunityMember,
  CreateCommunityData,
  UpdateCommunityData,
  CommunityFilters,
  JoinCommunityData,
  CommunityStats,
  CommunityInvite,
  CommunityContextType,
} from '@/types/community';

// Estado inicial
interface CommunityState {
  communities: Community[];
  currentCommunity: Community | null;
  userCommunities: Community[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CommunityState = {
  communities: [],
  currentCommunity: null,
  userCommunities: [],
  isLoading: false,
  error: null,
};

// Tipos de ações
type CommunityAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_COMMUNITIES'; payload: Community[] }
  | { type: 'SET_CURRENT_COMMUNITY'; payload: Community | null }
  | { type: 'SET_USER_COMMUNITIES'; payload: Community[] }
  | { type: 'ADD_COMMUNITY'; payload: Community }
  | { type: 'UPDATE_COMMUNITY'; payload: Community }
  | { type: 'REMOVE_COMMUNITY'; payload: string }
  | { type: 'JOIN_COMMUNITY'; payload: { communityId: string; userId: string } }
  | { type: 'LEAVE_COMMUNITY'; payload: { communityId: string; userId: string } };

// Reducer
function communityReducer(state: CommunityState, action: CommunityAction): CommunityState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    case 'SET_COMMUNITIES':
      return {
        ...state,
        communities: action.payload,
        isLoading: false,
        error: null,
      };
    
    case 'SET_CURRENT_COMMUNITY':
      return {
        ...state,
        currentCommunity: action.payload,
        isLoading: false,
        error: null,
      };
    
    case 'SET_USER_COMMUNITIES':
      return {
        ...state,
        userCommunities: action.payload,
        isLoading: false,
        error: null,
      };
    
    case 'ADD_COMMUNITY':
      return {
        ...state,
        communities: [action.payload, ...state.communities],
        userCommunities: [action.payload, ...state.userCommunities],
        isLoading: false,
        error: null,
      };
    
    case 'UPDATE_COMMUNITY':
      return {
        ...state,
        communities: state.communities.map(community =>
          community.id === action.payload.id ? action.payload : community
        ),
        userCommunities: state.userCommunities.map(community =>
          community.id === action.payload.id ? action.payload : community
        ),
        currentCommunity: state.currentCommunity?.id === action.payload.id
          ? action.payload
          : state.currentCommunity,
        isLoading: false,
        error: null,
      };
    
    case 'REMOVE_COMMUNITY':
      return {
        ...state,
        communities: state.communities.filter(community => community.id !== action.payload),
        userCommunities: state.userCommunities.filter(community => community.id !== action.payload),
        currentCommunity: state.currentCommunity?.id === action.payload
          ? null
          : state.currentCommunity,
        isLoading: false,
        error: null,
      };
    
    case 'JOIN_COMMUNITY':
      return {
        ...state,
        communities: state.communities.map(community =>
          community.id === action.payload.communityId
            ? { ...community, memberCount: community.memberCount + 1 }
            : community
        ),
        isLoading: false,
        error: null,
      };
    
    case 'LEAVE_COMMUNITY':
      return {
        ...state,
        communities: state.communities.map(community =>
          community.id === action.payload.communityId
            ? { ...community, memberCount: Math.max(0, community.memberCount - 1) }
            : community
        ),
        userCommunities: state.userCommunities.filter(
          community => community.id !== action.payload.communityId
        ),
        isLoading: false,
        error: null,
      };
    
    default:
      return state;
  }
}

// Contexto
const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

// Provider
interface CommunityProviderProps {
  children: ReactNode;
}

export function CommunityProvider({ children }: CommunityProviderProps) {
  const [state, dispatch] = useReducer(communityReducer, initialState);

  // Função para buscar comunidades
  const getCommunities = async (filters?: CommunityFilters): Promise<Community[]> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await communityService.getCommunities(filters);
      
      if (response.success) {
        dispatch({ type: 'SET_COMMUNITIES', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao buscar comunidades');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para buscar uma comunidade específica
  const getCommunity = async (id: string): Promise<Community> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await communityService.getCommunity(id);
      
      if (response.success) {
        dispatch({ type: 'SET_CURRENT_COMMUNITY', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao buscar comunidade');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para buscar comunidades do usuário
  const getUserCommunities = async (): Promise<Community[]> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await communityService.getUserCommunities();
      
      if (response.success) {
        dispatch({ type: 'SET_USER_COMMUNITIES', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao buscar suas comunidades');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para criar comunidade
  const createCommunity = async (data: CreateCommunityData): Promise<Community> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await communityService.createCommunity(data);
      
      if (response.success) {
        dispatch({ type: 'ADD_COMMUNITY', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao criar comunidade');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para atualizar comunidade
  const updateCommunity = async (id: string, data: UpdateCommunityData): Promise<Community> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await communityService.updateCommunity(id, data);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_COMMUNITY', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao atualizar comunidade');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para deletar comunidade
  const deleteCommunity = async (id: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await communityService.deleteCommunity(id);
      
      if (response.success) {
        dispatch({ type: 'REMOVE_COMMUNITY', payload: id });
      } else {
        throw new Error(response.message || 'Erro ao deletar comunidade');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para entrar em uma comunidade
  const joinCommunity = async (data: JoinCommunityData): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await communityService.joinCommunity(data);
      
      if (response.success) {
        dispatch({ type: 'JOIN_COMMUNITY', payload: { communityId: data.communityId, userId: 'current' } });
      } else {
        throw new Error(response.message || 'Erro ao entrar na comunidade');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para sair de uma comunidade
  const leaveCommunity = async (communityId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await communityService.leaveCommunity(communityId);
      
      if (response.success) {
        dispatch({ type: 'LEAVE_COMMUNITY', payload: { communityId, userId: 'current' } });
      } else {
        throw new Error(response.message || 'Erro ao sair da comunidade');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para buscar membros da comunidade
  const getCommunityMembers = async (communityId: string): Promise<CommunityMember[]> => {
    try {
      const response = await communityService.getCommunityMembers(communityId);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao buscar membros');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para atualizar papel de membro
  const updateMemberRole = async (communityId: string, userId: string, role: string): Promise<void> => {
    try {
      const response = await communityService.updateMemberRole(communityId, userId, role);
      
      if (!response.success) {
        throw new Error(response.message || 'Erro ao atualizar papel do membro');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para remover membro
  const removeMember = async (communityId: string, userId: string): Promise<void> => {
    try {
      const response = await communityService.removeMember(communityId, userId);
      
      if (!response.success) {
        throw new Error(response.message || 'Erro ao remover membro');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para convidar para comunidade
  const inviteToCommunit = async (communityId: string, email: string): Promise<CommunityInvite> => {
    try {
      const response = await communityService.inviteToCommunit(communityId, email);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao enviar convite');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para aceitar convite
  const acceptInvite = async (code: string): Promise<void> => {
    try {
      const response = await communityService.acceptInvite(code);
      
      if (!response.success) {
        throw new Error(response.message || 'Erro ao aceitar convite');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para buscar estatísticas
  const getCommunityStats = async (communityId: string): Promise<CommunityStats> => {
    try {
      const response = await communityService.getCommunityStats(communityId);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao buscar estatísticas');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para limpar erro
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Função para definir comunidade atual
  const setCurrentCommunity = (community: Community | null): void => {
    dispatch({ type: 'SET_CURRENT_COMMUNITY', payload: community });
  };

  const value: CommunityContextType = {
    ...state,
    createCommunity,
    updateCommunity,
    deleteCommunity,
    getCommunity,
    getCommunities,
    getUserCommunities,
    joinCommunity,
    leaveCommunity,
    getCommunityMembers,
    updateMemberRole,
    removeMember,
    inviteToCommunit,
    acceptInvite,
    getCommunityStats,
    clearError,
    setCurrentCommunity,
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}

// Hook para usar o contexto
export function useCommunity(): CommunityContextType {
  const context = useContext(CommunityContext);
  
  if (context === undefined) {
    throw new Error('useCommunity deve ser usado dentro de um CommunityProvider');
  }
  
  return context;
}

export default CommunityContext;