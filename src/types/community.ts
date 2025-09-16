export interface Community {
  id: string;
  name: string;
  description: string;
  image?: string;
  banner?: string;
  category: string;
  isPrivate: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner: {
    id: string;
    username: string;
    avatar?: string;
  };
  subscription?: {
    price: number;
    currency: string;
    benefits: string[];
  };
  tags: string[];
  rules: string[];
  socialLinks?: {
    website?: string;
    twitter?: string;
    discord?: string;
    telegram?: string;
  };
}

export interface CommunityMember {
  id: string;
  userId: string;
  communityId: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  joinedAt: string;
  isActive: boolean;
  user: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
  };
}

export interface CreateCommunityData {
  name: string;
  description: string;
  category: string;
  isPrivate: boolean;
  image?: File;
  banner?: File;
  tags: string[];
  rules: string[];
  subscription?: {
    price: number;
    currency: string;
    benefits: string[];
  };
  socialLinks?: {
    website?: string;
    twitter?: string;
    discord?: string;
    telegram?: string;
  };
}

export interface UpdateCommunityData {
  name?: string;
  description?: string;
  category?: string;
  isPrivate?: boolean;
  image?: File;
  banner?: File;
  tags?: string[];
  rules?: string[];
  subscription?: {
    price: number;
    currency: string;
    benefits: string[];
  };
  socialLinks?: {
    website?: string;
    twitter?: string;
    discord?: string;
    telegram?: string;
  };
}

export interface CommunityFilters {
  category?: string;
  search?: string;
  isPrivate?: boolean;
  hasSubscription?: boolean;
  tags?: string[];
  sortBy?: 'newest' | 'oldest' | 'members' | 'name';
  page?: number;
  limit?: number;
}

export interface JoinCommunityData {
  communityId: string;
  paymentMethod?: 'stellar' | 'card';
  transactionHash?: string;
}

export interface CommunityStats {
  totalMembers: number;
  activeMembers: number;
  totalPosts: number;
  totalComments: number;
  monthlyGrowth: number;
  revenue?: number;
}

export interface CommunityInvite {
  id: string;
  communityId: string;
  inviterId: string;
  inviteeEmail: string;
  code: string;
  expiresAt: string;
  isUsed: boolean;
  createdAt: string;
}

export interface CommunityApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CommunityContextType {
  communities: Community[];
  currentCommunity: Community | null;
  userCommunities: Community[];
  isLoading: boolean;
  error: string | null;
  
  // Funções de comunidade
  createCommunity: (data: CreateCommunityData) => Promise<Community>;
  updateCommunity: (id: string, data: UpdateCommunityData) => Promise<Community>;
  deleteCommunity: (id: string) => Promise<void>;
  getCommunity: (id: string) => Promise<Community>;
  getCommunities: (filters?: CommunityFilters) => Promise<Community[]>;
  getUserCommunities: () => Promise<Community[]>;
  
  // Funções de membros
  joinCommunity: (data: JoinCommunityData) => Promise<void>;
  leaveCommunity: (communityId: string) => Promise<void>;
  getCommunityMembers: (communityId: string) => Promise<CommunityMember[]>;
  updateMemberRole: (communityId: string, userId: string, role: string) => Promise<void>;
  removeMember: (communityId: string, userId: string) => Promise<void>;
  
  // Funções de convites
  inviteToCommunit: (communityId: string, email: string) => Promise<CommunityInvite>;
  acceptInvite: (code: string) => Promise<void>;
  
  // Funções de estatísticas
  getCommunityStats: (communityId: string) => Promise<CommunityStats>;
  
  // Funções de utilidade
  clearError: () => void;
  setCurrentCommunity: (community: Community | null) => void;
}