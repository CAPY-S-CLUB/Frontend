import { apiService } from './api';
import {
  ExclusiveContent,
  ContentComment,
  CreateContentData,
  UpdateContentData,
  ContentFilters,
  ContentProgress,
  ContentBookmark,
  ContentStats,
  ContentApiResponse,
  LiveStreamData,
  StreamMessage,
} from '@/types/content';

class ContentService {
  private readonly baseUrl = '/content';

  // Buscar conteúdos com filtros
  async getContents(filters?: ContentFilters): Promise<ContentApiResponse<ExclusiveContent[]>> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(item => params.append(key, item.toString()));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }
      
      const queryString = params.toString();
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
      
      const response = await apiService.get<ContentApiResponse<ExclusiveContent[]>>(url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar conteúdos');
    }
  }

  // Buscar um conteúdo específico
  async getContent(id: string): Promise<ContentApiResponse<ExclusiveContent>> {
    try {
      const response = await apiService.get<ContentApiResponse<ExclusiveContent>>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar conteúdo');
    }
  }

  // Buscar conteúdos do usuário
  async getUserContents(): Promise<ContentApiResponse<ExclusiveContent[]>> {
    try {
      const response = await apiService.get<ContentApiResponse<ExclusiveContent[]>>(`${this.baseUrl}/user`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar seus conteúdos');
    }
  }

  // Buscar conteúdos de uma comunidade
  async getCommunityContents(communityId: string, filters?: ContentFilters): Promise<ContentApiResponse<ExclusiveContent[]>> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(item => params.append(key, item.toString()));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }
      
      const queryString = params.toString();
      const url = queryString 
        ? `${this.baseUrl}/community/${communityId}?${queryString}` 
        : `${this.baseUrl}/community/${communityId}`;
      
      const response = await apiService.get<ContentApiResponse<ExclusiveContent[]>>(url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar conteúdos da comunidade');
    }
  }

  // Criar novo conteúdo
  async createContent(data: CreateContentData): Promise<ContentApiResponse<ExclusiveContent>> {
    try {
      const formData = new FormData();
      
      // Adicionar campos de texto
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('content', data.content);
      formData.append('type', data.type);
      formData.append('communityId', data.communityId);
      formData.append('accessLevel', data.accessLevel);
      formData.append('category', data.category);
      formData.append('tags', JSON.stringify(data.tags));
      formData.append('isPublished', data.isPublished.toString());
      
      if (data.requiredSubscription) {
        formData.append('requiredSubscription', JSON.stringify(data.requiredSubscription));
      }
      
      if (data.publishedAt) {
        formData.append('publishedAt', data.publishedAt);
      }
      
      // Adicionar arquivos
      if (data.thumbnail) {
        formData.append('thumbnail', data.thumbnail);
      }
      
      if (data.mediaFile) {
        formData.append('mediaFile', data.mediaFile);
      }
      
      const response = await apiService.post<ContentApiResponse<ExclusiveContent>>(this.baseUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar conteúdo');
    }
  }

  // Atualizar conteúdo
  async updateContent(id: string, data: UpdateContentData): Promise<ContentApiResponse<ExclusiveContent>> {
    try {
      const formData = new FormData();
      
      // Adicionar apenas campos que foram fornecidos
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'thumbnail' || key === 'mediaFile') {
            if (value instanceof File) {
              formData.append(key, value);
            }
          } else if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      
      const response = await apiService.put<ContentApiResponse<ExclusiveContent>>(`${this.baseUrl}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao atualizar conteúdo');
    }
  }

  // Deletar conteúdo
  async deleteContent(id: string): Promise<ContentApiResponse<void>> {
    try {
      const response = await apiService.delete<ContentApiResponse<void>>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao deletar conteúdo');
    }
  }

  // Curtir conteúdo
  async likeContent(contentId: string): Promise<ContentApiResponse<void>> {
    try {
      const response = await apiService.post<ContentApiResponse<void>>(`${this.baseUrl}/${contentId}/like`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao curtir conteúdo');
    }
  }

  // Descurtir conteúdo
  async unlikeContent(contentId: string): Promise<ContentApiResponse<void>> {
    try {
      const response = await apiService.delete<ContentApiResponse<void>>(`${this.baseUrl}/${contentId}/like`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao descurtir conteúdo');
    }
  }

  // Salvar conteúdo
  async bookmarkContent(contentId: string): Promise<ContentApiResponse<void>> {
    try {
      const response = await apiService.post<ContentApiResponse<void>>(`${this.baseUrl}/${contentId}/bookmark`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao salvar conteúdo');
    }
  }

  // Remover dos salvos
  async unbookmarkContent(contentId: string): Promise<ContentApiResponse<void>> {
    try {
      const response = await apiService.delete<ContentApiResponse<void>>(`${this.baseUrl}/${contentId}/bookmark`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao remover dos salvos');
    }
  }

  // Buscar conteúdos salvos
  async getBookmarkedContents(): Promise<ContentApiResponse<ExclusiveContent[]>> {
    try {
      const response = await apiService.get<ContentApiResponse<ExclusiveContent[]>>(`${this.baseUrl}/bookmarks`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar conteúdos salvos');
    }
  }

  // Buscar comentários do conteúdo
  async getContentComments(contentId: string): Promise<ContentApiResponse<ContentComment[]>> {
    try {
      const response = await apiService.get<ContentApiResponse<ContentComment[]>>(`${this.baseUrl}/${contentId}/comments`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar comentários');
    }
  }

  // Adicionar comentário
  async addComment(contentId: string, content: string, parentId?: string): Promise<ContentApiResponse<ContentComment>> {
    try {
      const response = await apiService.post<ContentApiResponse<ContentComment>>(`${this.baseUrl}/${contentId}/comments`, {
        content,
        parentId,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao adicionar comentário');
    }
  }

  // Atualizar comentário
  async updateComment(commentId: string, content: string): Promise<ContentApiResponse<ContentComment>> {
    try {
      const response = await apiService.put<ContentApiResponse<ContentComment>>(`/comments/${commentId}`, {
        content,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao atualizar comentário');
    }
  }

  // Deletar comentário
  async deleteComment(commentId: string): Promise<ContentApiResponse<void>> {
    try {
      const response = await apiService.delete<ContentApiResponse<void>>(`/comments/${commentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao deletar comentário');
    }
  }

  // Curtir comentário
  async likeComment(commentId: string): Promise<ContentApiResponse<void>> {
    try {
      const response = await apiService.post<ContentApiResponse<void>>(`/comments/${commentId}/like`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao curtir comentário');
    }
  }

  // Descurtir comentário
  async unlikeComment(commentId: string): Promise<ContentApiResponse<void>> {
    try {
      const response = await apiService.delete<ContentApiResponse<void>>(`/comments/${commentId}/like`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao descurtir comentário');
    }
  }

  // Atualizar progresso
  async updateProgress(contentId: string, progress: number, position?: number): Promise<ContentApiResponse<void>> {
    try {
      const response = await apiService.post<ContentApiResponse<void>>(`${this.baseUrl}/${contentId}/progress`, {
        progress,
        position,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao atualizar progresso');
    }
  }

  // Buscar progresso
  async getProgress(contentId: string): Promise<ContentApiResponse<ContentProgress | null>> {
    try {
      const response = await apiService.get<ContentApiResponse<ContentProgress | null>>(`${this.baseUrl}/${contentId}/progress`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar progresso');
    }
  }

  // Marcar como concluído
  async markAsCompleted(contentId: string): Promise<ContentApiResponse<void>> {
    try {
      const response = await apiService.post<ContentApiResponse<void>>(`${this.baseUrl}/${contentId}/complete`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao marcar como concluído');
    }
  }

  // Verificar acesso
  async checkAccess(contentId: string): Promise<ContentApiResponse<{ hasAccess: boolean; reason?: string }>> {
    try {
      const response = await apiService.get<ContentApiResponse<{ hasAccess: boolean; reason?: string }>>(`${this.baseUrl}/${contentId}/access`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao verificar acesso');
    }
  }

  // Comprar acesso
  async purchaseAccess(contentId: string, paymentMethod: string): Promise<ContentApiResponse<void>> {
    try {
      const response = await apiService.post<ContentApiResponse<void>>(`${this.baseUrl}/${contentId}/purchase`, {
        paymentMethod,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao comprar acesso');
    }
  }

  // Buscar estatísticas
  async getContentStats(contentId: string): Promise<ContentApiResponse<ContentStats>> {
    try {
      const response = await apiService.get<ContentApiResponse<ContentStats>>(`${this.baseUrl}/${contentId}/stats`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar estatísticas');
    }
  }

  // Pesquisar conteúdos
  async searchContents(query: string, filters?: ContentFilters): Promise<ContentApiResponse<ExclusiveContent[]>> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(item => params.append(key, item.toString()));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }
      
      const response = await apiService.get<ContentApiResponse<ExclusiveContent[]>>(`${this.baseUrl}/search?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao pesquisar conteúdos');
    }
  }

  // Buscar categorias
  async getCategories(): Promise<ContentApiResponse<string[]>> {
    try {
      const response = await apiService.get<ContentApiResponse<string[]>>('/content-categories');
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar categorias');
    }
  }

  // Buscar conteúdos em destaque
  async getFeaturedContents(): Promise<ContentApiResponse<ExclusiveContent[]>> {
    try {
      const response = await apiService.get<ContentApiResponse<ExclusiveContent[]>>(`${this.baseUrl}/featured`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar conteúdos em destaque');
    }
  }

  // Buscar conteúdos populares
  async getPopularContents(): Promise<ContentApiResponse<ExclusiveContent[]>> {
    try {
      const response = await apiService.get<ContentApiResponse<ExclusiveContent[]>>(`${this.baseUrl}/popular`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar conteúdos populares');
    }
  }

  // Live Streams
  async getLiveStreams(): Promise<ContentApiResponse<LiveStreamData[]>> {
    try {
      const response = await apiService.get<ContentApiResponse<LiveStreamData[]>>('/live-streams');
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar transmissões ao vivo');
    }
  }

  async createLiveStream(data: Partial<LiveStreamData>): Promise<ContentApiResponse<LiveStreamData>> {
    try {
      const response = await apiService.post<ContentApiResponse<LiveStreamData>>('/live-streams', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar transmissão ao vivo');
    }
  }

  async endLiveStream(streamId: string): Promise<ContentApiResponse<void>> {
    try {
      const response = await apiService.post<ContentApiResponse<void>>(`/live-streams/${streamId}/end`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao encerrar transmissão');
    }
  }
}

export const contentService = new ContentService();
export default contentService;