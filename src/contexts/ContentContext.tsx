'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { contentService } from '@/lib/contentService';
import {
  ExclusiveContent,
  ContentComment,
  CreateContentData,
  UpdateContentData,
  ContentFilters,
  ContentProgress,
  ContentStats,
  ContentContextType,
} from '@/types/content';

// Estado inicial
interface ContentState {
  contents: ExclusiveContent[];
  currentContent: ExclusiveContent | null;
  userContents: ExclusiveContent[];
  bookmarkedContents: ExclusiveContent[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ContentState = {
  contents: [],
  currentContent: null,
  userContents: [],
  bookmarkedContents: [],
  isLoading: false,
  error: null,
};

// Tipos de ações
type ContentAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_CONTENTS'; payload: ExclusiveContent[] }
  | { type: 'SET_CURRENT_CONTENT'; payload: ExclusiveContent | null }
  | { type: 'SET_USER_CONTENTS'; payload: ExclusiveContent[] }
  | { type: 'SET_BOOKMARKED_CONTENTS'; payload: ExclusiveContent[] }
  | { type: 'ADD_CONTENT'; payload: ExclusiveContent }
  | { type: 'UPDATE_CONTENT'; payload: ExclusiveContent }
  | { type: 'REMOVE_CONTENT'; payload: string }
  | { type: 'LIKE_CONTENT'; payload: { contentId: string; isLiked: boolean } }
  | { type: 'BOOKMARK_CONTENT'; payload: { contentId: string; isBookmarked: boolean } }
  | { type: 'UPDATE_PROGRESS'; payload: { contentId: string; progress: number } };

// Reducer
function contentReducer(state: ContentState, action: ContentAction): ContentState {
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
    
    case 'SET_CONTENTS':
      return {
        ...state,
        contents: action.payload,
        isLoading: false,
        error: null,
      };
    
    case 'SET_CURRENT_CONTENT':
      return {
        ...state,
        currentContent: action.payload,
        isLoading: false,
        error: null,
      };
    
    case 'SET_USER_CONTENTS':
      return {
        ...state,
        userContents: action.payload,
        isLoading: false,
        error: null,
      };
    
    case 'SET_BOOKMARKED_CONTENTS':
      return {
        ...state,
        bookmarkedContents: action.payload,
        isLoading: false,
        error: null,
      };
    
    case 'ADD_CONTENT':
      return {
        ...state,
        contents: [action.payload, ...state.contents],
        userContents: [action.payload, ...state.userContents],
        isLoading: false,
        error: null,
      };
    
    case 'UPDATE_CONTENT':
      const updateContentInArray = (contents: ExclusiveContent[]) =>
        contents.map(content =>
          content.id === action.payload.id ? action.payload : content
        );
      
      return {
        ...state,
        contents: updateContentInArray(state.contents),
        userContents: updateContentInArray(state.userContents),
        bookmarkedContents: updateContentInArray(state.bookmarkedContents),
        currentContent: state.currentContent?.id === action.payload.id
          ? action.payload
          : state.currentContent,
        isLoading: false,
        error: null,
      };
    
    case 'REMOVE_CONTENT':
      return {
        ...state,
        contents: state.contents.filter(content => content.id !== action.payload),
        userContents: state.userContents.filter(content => content.id !== action.payload),
        bookmarkedContents: state.bookmarkedContents.filter(content => content.id !== action.payload),
        currentContent: state.currentContent?.id === action.payload
          ? null
          : state.currentContent,
        isLoading: false,
        error: null,
      };
    
    case 'LIKE_CONTENT':
      const updateLikeInArray = (contents: ExclusiveContent[]) =>
        contents.map(content =>
          content.id === action.payload.contentId
            ? {
                ...content,
                isLiked: action.payload.isLiked,
                likeCount: action.payload.isLiked
                  ? content.likeCount + 1
                  : Math.max(0, content.likeCount - 1),
              }
            : content
        );
      
      return {
        ...state,
        contents: updateLikeInArray(state.contents),
        userContents: updateLikeInArray(state.userContents),
        bookmarkedContents: updateLikeInArray(state.bookmarkedContents),
        currentContent: state.currentContent?.id === action.payload.contentId
          ? {
              ...state.currentContent,
              isLiked: action.payload.isLiked,
              likeCount: action.payload.isLiked
                ? state.currentContent.likeCount + 1
                : Math.max(0, state.currentContent.likeCount - 1),
            }
          : state.currentContent,
      };
    
    case 'BOOKMARK_CONTENT':
      const updateBookmarkInArray = (contents: ExclusiveContent[]) =>
        contents.map(content =>
          content.id === action.payload.contentId
            ? { ...content, isBookmarked: action.payload.isBookmarked }
            : content
        );
      
      return {
        ...state,
        contents: updateBookmarkInArray(state.contents),
        userContents: updateBookmarkInArray(state.userContents),
        currentContent: state.currentContent?.id === action.payload.contentId
          ? { ...state.currentContent, isBookmarked: action.payload.isBookmarked }
          : state.currentContent,
      };
    
    case 'UPDATE_PROGRESS':
      const updateProgressInArray = (contents: ExclusiveContent[]) =>
        contents.map(content =>
          content.id === action.payload.contentId
            ? { ...content, progress: action.payload.progress }
            : content
        );
      
      return {
        ...state,
        contents: updateProgressInArray(state.contents),
        userContents: updateProgressInArray(state.userContents),
        bookmarkedContents: updateProgressInArray(state.bookmarkedContents),
        currentContent: state.currentContent?.id === action.payload.contentId
          ? { ...state.currentContent, progress: action.payload.progress }
          : state.currentContent,
      };
    
    default:
      return state;
  }
}

// Contexto
const ContentContext = createContext<ContentContextType | undefined>(undefined);

// Provider
interface ContentProviderProps {
  children: ReactNode;
}

export function ContentProvider({ children }: ContentProviderProps) {
  const [state, dispatch] = useReducer(contentReducer, initialState);

  // Função para buscar conteúdos
  const getContents = async (filters?: ContentFilters): Promise<ExclusiveContent[]> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await contentService.getContents(filters);
      
      if (response.success) {
        dispatch({ type: 'SET_CONTENTS', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao buscar conteúdos');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para buscar um conteúdo específico
  const getContent = async (id: string): Promise<ExclusiveContent> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await contentService.getContent(id);
      
      if (response.success) {
        dispatch({ type: 'SET_CURRENT_CONTENT', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao buscar conteúdo');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para buscar conteúdos do usuário
  const getUserContents = async (): Promise<ExclusiveContent[]> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await contentService.getUserContents();
      
      if (response.success) {
        dispatch({ type: 'SET_USER_CONTENTS', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao buscar seus conteúdos');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para buscar conteúdos de uma comunidade
  const getCommunityContents = async (communityId: string, filters?: ContentFilters): Promise<ExclusiveContent[]> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await contentService.getCommunityContents(communityId, filters);
      
      if (response.success) {
        dispatch({ type: 'SET_CONTENTS', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao buscar conteúdos da comunidade');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para criar conteúdo
  const createContent = async (data: CreateContentData): Promise<ExclusiveContent> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await contentService.createContent(data);
      
      if (response.success) {
        dispatch({ type: 'ADD_CONTENT', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao criar conteúdo');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para atualizar conteúdo
  const updateContent = async (id: string, data: UpdateContentData): Promise<ExclusiveContent> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await contentService.updateContent(id, data);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_CONTENT', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao atualizar conteúdo');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para deletar conteúdo
  const deleteContent = async (id: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await contentService.deleteContent(id);
      
      if (response.success) {
        dispatch({ type: 'REMOVE_CONTENT', payload: id });
      } else {
        throw new Error(response.message || 'Erro ao deletar conteúdo');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para curtir conteúdo
  const likeContent = async (contentId: string): Promise<void> => {
    try {
      const response = await contentService.likeContent(contentId);
      
      if (response.success) {
        dispatch({ type: 'LIKE_CONTENT', payload: { contentId, isLiked: true } });
      } else {
        throw new Error(response.message || 'Erro ao curtir conteúdo');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para descurtir conteúdo
  const unlikeContent = async (contentId: string): Promise<void> => {
    try {
      const response = await contentService.unlikeContent(contentId);
      
      if (response.success) {
        dispatch({ type: 'LIKE_CONTENT', payload: { contentId, isLiked: false } });
      } else {
        throw new Error(response.message || 'Erro ao descurtir conteúdo');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para salvar conteúdo
  const bookmarkContent = async (contentId: string): Promise<void> => {
    try {
      const response = await contentService.bookmarkContent(contentId);
      
      if (response.success) {
        dispatch({ type: 'BOOKMARK_CONTENT', payload: { contentId, isBookmarked: true } });
      } else {
        throw new Error(response.message || 'Erro ao salvar conteúdo');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para remover dos salvos
  const unbookmarkContent = async (contentId: string): Promise<void> => {
    try {
      const response = await contentService.unbookmarkContent(contentId);
      
      if (response.success) {
        dispatch({ type: 'BOOKMARK_CONTENT', payload: { contentId, isBookmarked: false } });
      } else {
        throw new Error(response.message || 'Erro ao remover dos salvos');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para buscar conteúdos salvos
  const getBookmarkedContents = async (): Promise<ExclusiveContent[]> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await contentService.getBookmarkedContents();
      
      if (response.success) {
        dispatch({ type: 'SET_BOOKMARKED_CONTENTS', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao buscar conteúdos salvos');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para buscar comentários
  const getContentComments = async (contentId: string): Promise<ContentComment[]> => {
    try {
      const response = await contentService.getContentComments(contentId);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao buscar comentários');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para adicionar comentário
  const addComment = async (contentId: string, content: string, parentId?: string): Promise<ContentComment> => {
    try {
      const response = await contentService.addComment(contentId, content, parentId);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao adicionar comentário');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para atualizar comentário
  const updateComment = async (commentId: string, content: string): Promise<ContentComment> => {
    try {
      const response = await contentService.updateComment(commentId, content);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao atualizar comentário');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para deletar comentário
  const deleteComment = async (commentId: string): Promise<void> => {
    try {
      const response = await contentService.deleteComment(commentId);
      
      if (!response.success) {
        throw new Error(response.message || 'Erro ao deletar comentário');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para curtir comentário
  const likeComment = async (commentId: string): Promise<void> => {
    try {
      const response = await contentService.likeComment(commentId);
      
      if (!response.success) {
        throw new Error(response.message || 'Erro ao curtir comentário');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para descurtir comentário
  const unlikeComment = async (commentId: string): Promise<void> => {
    try {
      const response = await contentService.unlikeComment(commentId);
      
      if (!response.success) {
        throw new Error(response.message || 'Erro ao descurtir comentário');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para atualizar progresso
  const updateProgress = async (contentId: string, progress: number, position?: number): Promise<void> => {
    try {
      const response = await contentService.updateProgress(contentId, progress, position);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_PROGRESS', payload: { contentId, progress } });
      } else {
        throw new Error(response.message || 'Erro ao atualizar progresso');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para buscar progresso
  const getProgress = async (contentId: string): Promise<ContentProgress | null> => {
    try {
      const response = await contentService.getProgress(contentId);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao buscar progresso');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para marcar como concluído
  const markAsCompleted = async (contentId: string): Promise<void> => {
    try {
      const response = await contentService.markAsCompleted(contentId);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_PROGRESS', payload: { contentId, progress: 100 } });
      } else {
        throw new Error(response.message || 'Erro ao marcar como concluído');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para verificar acesso
  const checkAccess = async (contentId: string): Promise<{ hasAccess: boolean; reason?: string }> => {
    try {
      const response = await contentService.checkAccess(contentId);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao verificar acesso');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para comprar acesso
  const purchaseAccess = async (contentId: string, paymentMethod: string): Promise<void> => {
    try {
      const response = await contentService.purchaseAccess(contentId, paymentMethod);
      
      if (!response.success) {
        throw new Error(response.message || 'Erro ao comprar acesso');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Função para buscar estatísticas
  const getContentStats = async (contentId: string): Promise<ContentStats> => {
    try {
      const response = await contentService.getContentStats(contentId);
      
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

  // Função para pesquisar conteúdos
  const searchContents = async (query: string, filters?: ContentFilters): Promise<ExclusiveContent[]> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await contentService.searchContents(query, filters);
      
      if (response.success) {
        dispatch({ type: 'SET_CONTENTS', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao pesquisar conteúdos');
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

  // Função para definir conteúdo atual
  const setCurrentContent = (content: ExclusiveContent | null): void => {
    dispatch({ type: 'SET_CURRENT_CONTENT', payload: content });
  };

  const value: ContentContextType = {
    ...state,
    createContent,
    updateContent,
    deleteContent,
    getContent,
    getContents,
    getUserContents,
    getCommunityContents,
    likeContent,
    unlikeContent,
    bookmarkContent,
    unbookmarkContent,
    getBookmarkedContents,
    getContentComments,
    addComment,
    updateComment,
    deleteComment,
    likeComment,
    unlikeComment,
    updateProgress,
    getProgress,
    markAsCompleted,
    checkAccess,
    purchaseAccess,
    getContentStats,
    clearError,
    setCurrentContent,
    searchContents,
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
}

// Hook para usar o contexto
export function useContent(): ContentContextType {
  const context = useContext(ContentContext);
  
  if (context === undefined) {
    throw new Error('useContent deve ser usado dentro de um ContentProvider');
  }
  
  return context;
}

export default ContentContext;