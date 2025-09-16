import { apiService } from './api';
import {
  Community,
  CommunityMember,
  CreateCommunityData,
  UpdateCommunityData,
  CommunityFilters,
  JoinCommunityData,
  CommunityStats,
  CommunityInvite,
  CommunityApiResponse,
} from '@/types/community';

class CommunityService {
  private readonly baseUrl = '/communities';

  // Buscar todas as comunidades com filtros
  async getCommunities(filters?: CommunityFilters): Promise<CommunityApiResponse<Community[]>> {
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
      
      const response = await apiService.get<CommunityApiResponse<Community[]>>(url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar comunidades');
    }
  }

  // Buscar uma comunidade específica
  async getCommunity(id: string): Promise<CommunityApiResponse<Community>> {
    try {
      const response = await apiService.get<CommunityApiResponse<Community>>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar comunidade');
    }
  }

  // Buscar comunidades do usuário
  async getUserCommunities(): Promise<CommunityApiResponse<Community[]>> {
    try {
      const response = await apiService.get<CommunityApiResponse<Community[]>>(`${this.baseUrl}/user`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar suas comunidades');
    }
  }

  // Criar nova comunidade
  async createCommunity(data: CreateCommunityData): Promise<CommunityApiResponse<Community>> {
    try {
      const formData = new FormData();
      
      // Adicionar campos de texto
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('isPrivate', data.isPrivate.toString());
      formData.append('tags', JSON.stringify(data.tags));
      formData.append('rules', JSON.stringify(data.rules));
      
      if (data.subscription) {
        formData.append('subscription', JSON.stringify(data.subscription));
      }
      
      if (data.socialLinks) {
        formData.append('socialLinks', JSON.stringify(data.socialLinks));
      }
      
      // Adicionar arquivos
      if (data.image) {
        formData.append('image', data.image);
      }
      
      if (data.banner) {
        formData.append('banner', data.banner);
      }
      
      const response = await apiService.post<CommunityApiResponse<Community>>(this.baseUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar comunidade');
    }
  }

  // Atualizar comunidade
  async updateCommunity(id: string, data: UpdateCommunityData): Promise<CommunityApiResponse<Community>> {
    try {
      const formData = new FormData();
      
      // Adicionar apenas campos que foram fornecidos
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'image' || key === 'banner') {
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
      
      const response = await apiService.put<CommunityApiResponse<Community>>(`${this.baseUrl}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao atualizar comunidade');
    }
  }

  // Deletar comunidade
  async deleteCommunity(id: string): Promise<CommunityApiResponse<void>> {
    try {
      const response = await apiService.delete<CommunityApiResponse<void>>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao deletar comunidade');
    }
  }

  // Entrar em uma comunidade
  async joinCommunity(data: JoinCommunityData): Promise<CommunityApiResponse<void>> {
    try {
      const response = await apiService.post<CommunityApiResponse<void>>(`${this.baseUrl}/${data.communityId}/join`, {
        paymentMethod: data.paymentMethod,
        transactionHash: data.transactionHash,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao entrar na comunidade');
    }
  }

  // Sair de uma comunidade
  async leaveCommunity(communityId: string): Promise<CommunityApiResponse<void>> {
    try {
      const response = await apiService.post<CommunityApiResponse<void>>(`${this.baseUrl}/${communityId}/leave`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao sair da comunidade');
    }
  }

  // Buscar membros da comunidade
  async getCommunityMembers(communityId: string): Promise<CommunityApiResponse<CommunityMember[]>> {
    try {
      const response = await apiService.get<CommunityApiResponse<CommunityMember[]>>(`${this.baseUrl}/${communityId}/members`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar membros da comunidade');
    }
  }

  // Atualizar papel de um membro
  async updateMemberRole(communityId: string, userId: string, role: string): Promise<CommunityApiResponse<void>> {
    try {
      const response = await apiService.put<CommunityApiResponse<void>>(`${this.baseUrl}/${communityId}/members/${userId}`, {
        role,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao atualizar papel do membro');
    }
  }

  // Remover membro da comunidade
  async removeMember(communityId: string, userId: string): Promise<CommunityApiResponse<void>> {
    try {
      const response = await apiService.delete<CommunityApiResponse<void>>(`${this.baseUrl}/${communityId}/members/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao remover membro');
    }
  }

  // Convidar para comunidade
  async inviteToCommunit(communityId: string, email: string): Promise<CommunityApiResponse<CommunityInvite>> {
    try {
      const response = await apiService.post<CommunityApiResponse<CommunityInvite>>(`${this.baseUrl}/${communityId}/invite`, {
        email,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao enviar convite');
    }
  }

  // Aceitar convite
  async acceptInvite(code: string): Promise<CommunityApiResponse<void>> {
    try {
      const response = await apiService.post<CommunityApiResponse<void>>('/invites/accept', {
        code,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao aceitar convite');
    }
  }

  // Buscar estatísticas da comunidade
  async getCommunityStats(communityId: string): Promise<CommunityApiResponse<CommunityStats>> {
    try {
      const response = await apiService.get<CommunityApiResponse<CommunityStats>>(`${this.baseUrl}/${communityId}/stats`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar estatísticas');
    }
  }

  // Buscar categorias disponíveis
  async getCategories(): Promise<CommunityApiResponse<string[]>> {
    try {
      const response = await apiService.get<CommunityApiResponse<string[]>>('/categories');
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar categorias');
    }
  }

  // Buscar comunidades em destaque
  async getFeaturedCommunities(): Promise<CommunityApiResponse<Community[]>> {
    try {
      const response = await apiService.get<CommunityApiResponse<Community[]>>(`${this.baseUrl}/featured`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar comunidades em destaque');
    }
  }

  // Verificar se o usuário é membro de uma comunidade
  async checkMembership(communityId: string): Promise<CommunityApiResponse<{ isMember: boolean; role?: string }>> {
    try {
      const response = await apiService.get<CommunityApiResponse<{ isMember: boolean; role?: string }>>(`${this.baseUrl}/${communityId}/membership`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao verificar associação');
    }
  }
}

export const communityService = new CommunityService();
export default communityService;