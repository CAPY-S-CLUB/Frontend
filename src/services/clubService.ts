// Serviço para gerenciar clubs via API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Club {
  id: string;
  name: string;
  members: number;
  status: 'active' | 'inactive';
  createdDate: string;
  description?: string;
  category?: string;
  maxMembers?: number;
  membershipFee?: number;
  location?: string;
  requirements?: string;
}

export interface CreateClubData {
  name: string;
  description?: string;
  category: string;
  maxMembers?: number;
  membershipFee?: number;
  location?: string;
  requirements?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}

class ClubService {
  private async fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Buscar todos os clubs
  async getAllClubs(): Promise<Club[]> {
    const response = await this.fetchApi<Club[]>('/clubs');
    return response.data;
  }

  // Buscar club por ID
  async getClubById(id: string): Promise<Club> {
    const response = await this.fetchApi<Club>(`/clubs/${id}`);
    return response.data;
  }

  // Criar novo club
  async createClub(clubData: CreateClubData): Promise<Club> {
    const response = await this.fetchApi<Club>('/clubs', {
      method: 'POST',
      body: JSON.stringify(clubData),
    });
    return response.data;
  }

  // Atualizar club
  async updateClub(id: string, clubData: Partial<CreateClubData>): Promise<Club> {
    const response = await this.fetchApi<Club>(`/clubs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clubData),
    });
    return response.data;
  }

  // Deletar club
  async deleteClub(id: string): Promise<void> {
    await this.fetchApi(`/clubs/${id}`, {
      method: 'DELETE',
    });
  }

  // Obter estatísticas dos clubs
  async getClubStats(): Promise<any> {
    const response = await this.fetchApi<any>('/clubs/stats');
    return response.data;
  }

  // Buscar clubs por categoria
  async getClubsByCategory(category: string): Promise<Club[]> {
    const response = await this.fetchApi<Club[]>(`/clubs?category=${encodeURIComponent(category)}`);
    return response.data;
  }

  // Buscar clubs ativos
  async getActiveClubs(): Promise<Club[]> {
    const response = await this.fetchApi<Club[]>('/clubs?status=active');
    return response.data;
  }
}

// Exportar instância singleton
export const clubService = new ClubService();
export default clubService;