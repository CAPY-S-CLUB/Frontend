// Utilitários para testes e validação

// Mock para localStorage
export const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

// Mock para sessionStorage
export const mockSessionStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

// Mock de dados para testes
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  name: 'Test User',
  avatar: 'https://example.com/avatar.jpg',
  bio: 'Test bio',
  isVerified: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const mockCommunity = {
  id: '1',
  name: 'Test Community',
  description: 'A test community',
  slug: 'test-community',
  avatar: 'https://example.com/community-avatar.jpg',
  banner: 'https://example.com/community-banner.jpg',
  isPrivate: false,
  memberCount: 100,
  contentCount: 50,
  category: 'Technology',
  tags: ['test', 'community'],
  rules: ['Be respectful', 'No spam'],
  socialLinks: {
    website: 'https://example.com',
    twitter: 'https://twitter.com/test',
    discord: 'https://discord.gg/test',
  },
  settings: {
    allowMemberInvites: true,
    requireApproval: false,
    allowContentCreation: true,
  },
  ownerId: '1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const mockContent = {
  id: '1',
  title: 'Test Content',
  description: 'Test content description',
  type: 'video' as const,
  url: 'https://example.com/video.mp4',
  thumbnail: 'https://example.com/thumbnail.jpg',
  duration: 3600,
  isPublic: false,
  isPremium: true,
  price: 9.99,
  currency: 'USD',
  tags: ['test', 'content'],
  category: 'Education',
  difficulty: 'beginner' as const,
  language: 'pt-BR',
  likeCount: 10,
  viewCount: 100,
  commentCount: 5,
  isLiked: false,
  isBookmarked: false,
  progress: 0,
  communityId: '1',
  authorId: '1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const mockComment = {
  id: '1',
  content: 'Test comment',
  authorId: '1',
  author: mockUser,
  contentId: '1',
  parentId: null,
  likeCount: 2,
  isLiked: false,
  replies: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Mock de respostas da API
export const mockApiResponse = {
  success: true,
  message: 'Success',
  data: null,
};

export const mockApiError = {
  success: false,
  message: 'Error occurred',
  error: 'API_ERROR',
};

// Função para simular delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Função para simular erro de rede
export const networkError = () => {
  throw new Error('Network Error');
};

// Função para validar dados de entrada
export function validateTestData(data: any, requiredFields: string[]): boolean {
  for (const field of requiredFields) {
    if (!data[field]) {
      console.error(`Campo obrigatório ausente: ${field}`);
      return false;
    }
  }
  return true;
}

// Função para criar dados de teste
export function createTestUser(overrides: Partial<typeof mockUser> = {}) {
  return { ...mockUser, ...overrides };
}

export function createTestCommunity(overrides: Partial<typeof mockCommunity> = {}) {
  return { ...mockCommunity, ...overrides };
}

export function createTestContent(overrides: Partial<typeof mockContent> = {}) {
  return { ...mockContent, ...overrides };
}

export function createTestComment(overrides: Partial<typeof mockComment> = {}) {
  return { ...mockComment, ...overrides };
}

// Função para simular resposta da API
export function createMockApiResponse<T>(data: T, success: boolean = true) {
  return {
    success,
    message: success ? 'Success' : 'Error',
    data: success ? data : null,
    error: success ? null : 'API_ERROR',
  };
}

// Função para testar URLs
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Função para testar emails
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Função para testar senhas
export function isValidPassword(password: string): boolean {
  return password.length >= 8 && 
         /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
}

// Função para gerar IDs únicos para testes
export function generateTestId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Função para limpar dados de teste
export function clearTestData(): void {
  mockLocalStorage.clear();
  mockSessionStorage.clear();
}

// Função para simular eventos de usuário
export const simulateUserEvents = {
  click: (element: HTMLElement) => {
    if (element && typeof element.click === 'function') {
      element.click();
    }
  },
  
  input: (element: HTMLInputElement, value: string) => {
    if (element) {
      element.value = value;
      const event = new Event('input', { bubbles: true });
      element.dispatchEvent(event);
    }
  },
  
  submit: (form: HTMLFormElement) => {
    if (form) {
      const event = new Event('submit', { bubbles: true });
      form.dispatchEvent(event);
    }
  },
};

// Função para aguardar condição
export async function waitForCondition(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return;
    }
    await delay(interval);
  }
  
  throw new Error(`Condition not met within ${timeout}ms`);
}

// Função para testar performance
export function measurePerformance<T>(fn: () => T, label: string = 'Operation'): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`${label} took ${end - start} milliseconds`);
  return result;
}

// Função para testar performance assíncrona
export async function measureAsyncPerformance<T>(
  fn: () => Promise<T>,
  label: string = 'Async Operation'
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  console.log(`${label} took ${end - start} milliseconds`);
  return result;
}

// Função para debug de estado
export function debugState(state: any, label: string = 'State'): void {
  console.group(`🐛 Debug: ${label}`);
  console.log(JSON.stringify(state, null, 2));
  console.groupEnd();
}

// Função para log de teste
export function testLog(message: string, data?: any): void {
  console.log(`🧪 Test: ${message}`, data || '');
}

// Função para verificar se está em ambiente de teste
export function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test' || 
         typeof window !== 'undefined' && window.location.hostname === 'localhost';
}