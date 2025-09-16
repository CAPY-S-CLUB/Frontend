import { apiService } from './api';
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  TokenResponse,
} from '@/types/auth';

class AuthService {
  private readonly baseUrl = '/auth';
  private readonly TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';

  // Verificar se o usuário está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token && !this.isTokenExpired(token);
  }

  // Verificar se o token está expirado
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  // Fazer login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(`${this.baseUrl}/login`, credentials);
      
      if (response.data.success) {
        const { accessToken, refreshToken } = response.data.data;
        this.setTokens(accessToken, refreshToken);
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
  }

  // Fazer registro
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(`${this.baseUrl}/register`, credentials);
      
      if (response.data.success) {
        const { accessToken, refreshToken } = response.data.data;
        this.setTokens(accessToken, refreshToken);
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao criar conta');
    }
  }

  // Fazer logout
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      
      if (refreshToken) {
        await apiService.post(`${this.baseUrl}/logout`, { refreshToken });
      }
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error);
    } finally {
      this.clearTokens();
    }
  }

  // Obter usuário atual
  async getCurrentUser(): Promise<User | null> {
    try {
      if (!this.isAuthenticated()) {
        return null;
      }

      const response = await apiService.get<{ success: boolean; data: User }>(`${this.baseUrl}/me`);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  }

  // Renovar token de acesso
  async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        return null;
      }

      const response = await apiService.post<TokenResponse>(`${this.baseUrl}/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      this.setTokens(accessToken, newRefreshToken);
      
      return accessToken;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      this.clearTokens();
      return null;
    }
  }

  // Obter token de acesso
  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Obter token de refresh
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Definir tokens no localStorage
  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  // Limpar tokens do localStorage
  private clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // Verificar se o email está disponível
  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const response = await apiService.get<{ available: boolean }>(`${this.baseUrl}/check-email?email=${encodeURIComponent(email)}`);
      return response.data.available;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade do email:', error);
      return false;
    }
  }

  // Verificar se o username está disponível
  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const response = await apiService.get<{ available: boolean }>(`${this.baseUrl}/check-username?username=${encodeURIComponent(username)}`);
      return response.data.available;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade do username:', error);
      return false;
    }
  }

  // Solicitar reset de senha
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await apiService.post(`${this.baseUrl}/forgot-password`, { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao solicitar reset de senha');
    }
  }

  // Resetar senha
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiService.post(`${this.baseUrl}/reset-password`, {
        token,
        password: newPassword,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao resetar senha');
    }
  }
}

export const authService = new AuthService();
export default authService;