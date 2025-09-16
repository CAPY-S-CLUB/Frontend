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
  // Mock data para desenvolvimento local
  private mockClubs: Club[] = [
    {
      id: '1',
      name: 'Marina Bay Yacht Club',
      members: 45,
      status: 'active',
      createdDate: '2024-01-15',
      description: 'Exclusive yacht club for luxury boat owners',
      category: 'yacht',
      maxMembers: 100,
      membershipFee: 5000,
      location: 'Marina Bay, Singapore',
      requirements: 'Own a yacht worth minimum $500k'
    },
    {
      id: '2',
      name: 'Atlantic Sailing Club',
      members: 32,
      status: 'active',
      createdDate: '2024-02-20',
      description: 'Community for sailing enthusiasts',
      category: 'sailing',
      maxMembers: 75,
      membershipFee: 2500,
      location: 'Newport, Rhode Island',
      requirements: 'Basic sailing certification required'
    }
  ];

  private async fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Tentar fazer requisição real primeiro
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
      console.warn('API não disponível, usando dados mock:', error);
      // Fallback para dados mock
      return this.handleMockRequest<T>(endpoint, options);
    }
  }

  private handleMockRequest<T>(endpoint: string, options: RequestInit = {}): ApiResponse<T> {
    const method = options.method || 'GET';
    
    if (endpoint === '/clubs' && method === 'GET') {
      return {
        success: true,
        data: this.mockClubs as T,
        total: this.mockClubs.length
      };
    }
    
    if (endpoint === '/clubs' && method === 'POST') {
      const body = JSON.parse(options.body as string) as CreateClubData;
      const newClub: Club = {
        id: Date.now().toString(),
        name: body.name,
        members: 0,
        status: 'active',
        createdDate: new Date().toISOString().split('T')[0],
        description: body.description,
        category: body.category,
        maxMembers: body.maxMembers,
        membershipFee: body.membershipFee,
        location: body.location,
        requirements: body.requirements
      };
      
      this.mockClubs.push(newClub);
      return {
        success: true,
        data: newClub as T,
        message: 'Club criado com sucesso!'
      };
    }
    
    if (endpoint.startsWith('/clubs/') && method === 'DELETE') {
      const id = endpoint.split('/')[2];
      this.mockClubs = this.mockClubs.filter(club => club.id !== id);
      return {
        success: true,
        data: null as T,
        message: 'Club removido com sucesso!'
      };
    }
    
    throw new Error(`Mock endpoint não implementado: ${method} ${endpoint}`);
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