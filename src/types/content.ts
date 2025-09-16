export interface ExclusiveContent {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'article' | 'video' | 'audio' | 'image' | 'document' | 'live_stream';
  thumbnail?: string;
  mediaUrl?: string;
  duration?: number; // em segundos para vídeo/áudio
  fileSize?: number; // em bytes
  communityId: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  community: {
    id: string;
    name: string;
    image?: string;
  };
  accessLevel: 'free' | 'premium' | 'vip' | 'exclusive';
  requiredSubscription?: {
    tier: string;
    price: number;
    currency: string;
  };
  tags: string[];
  category: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  downloadCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  hasAccess?: boolean;
  progress?: number; // progresso de visualização (0-100)
}

export interface ContentComment {
  id: string;
  contentId: string;
  userId: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
  content: string;
  parentId?: string; // para respostas
  replies?: ContentComment[];
  likeCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContentData {
  title: string;
  description: string;
  content: string;
  type: 'article' | 'video' | 'audio' | 'image' | 'document' | 'live_stream';
  communityId: string;
  accessLevel: 'free' | 'premium' | 'vip' | 'exclusive';
  requiredSubscription?: {
    tier: string;
    price: number;
    currency: string;
  };
  tags: string[];
  category: string;
  thumbnail?: File;
  mediaFile?: File;
  isPublished: boolean;
  publishedAt?: string;
}

export interface UpdateContentData {
  title?: string;
  description?: string;
  content?: string;
  accessLevel?: 'free' | 'premium' | 'vip' | 'exclusive';
  requiredSubscription?: {
    tier: string;
    price: number;
    currency: string;
  };
  tags?: string[];
  category?: string;
  thumbnail?: File;
  mediaFile?: File;
  isPublished?: boolean;
  publishedAt?: string;
}

export interface ContentFilters {
  communityId?: string;
  authorId?: string;
  type?: 'article' | 'video' | 'audio' | 'image' | 'document' | 'live_stream';
  accessLevel?: 'free' | 'premium' | 'vip' | 'exclusive';
  category?: string;
  tags?: string[];
  search?: string;
  isPublished?: boolean;
  hasAccess?: boolean;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'trending' | 'views' | 'likes';
  page?: number;
  limit?: number;
}

export interface ContentProgress {
  id: string;
  contentId: string;
  userId: string;
  progress: number; // 0-100
  lastPosition?: number; // posição em segundos para vídeo/áudio
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentBookmark {
  id: string;
  contentId: string;
  userId: string;
  content: ExclusiveContent;
  createdAt: string;
}

export interface ContentLike {
  id: string;
  contentId: string;
  userId: string;
  createdAt: string;
}

export interface ContentStats {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalDownloads: number;
  averageRating: number;
  completionRate: number;
  engagementRate: number;
  revenueGenerated?: number;
}

export interface ContentApiResponse<T = any> {
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

export interface ContentContextType {
  contents: ExclusiveContent[];
  currentContent: ExclusiveContent | null;
  userContents: ExclusiveContent[];
  bookmarkedContents: ExclusiveContent[];
  isLoading: boolean;
  error: string | null;
  
  // Funções de conteúdo
  createContent: (data: CreateContentData) => Promise<ExclusiveContent>;
  updateContent: (id: string, data: UpdateContentData) => Promise<ExclusiveContent>;
  deleteContent: (id: string) => Promise<void>;
  getContent: (id: string) => Promise<ExclusiveContent>;
  getContents: (filters?: ContentFilters) => Promise<ExclusiveContent[]>;
  getUserContents: () => Promise<ExclusiveContent[]>;
  getCommunityContents: (communityId: string, filters?: ContentFilters) => Promise<ExclusiveContent[]>;
  
  // Funções de interação
  likeContent: (contentId: string) => Promise<void>;
  unlikeContent: (contentId: string) => Promise<void>;
  bookmarkContent: (contentId: string) => Promise<void>;
  unbookmarkContent: (contentId: string) => Promise<void>;
  getBookmarkedContents: () => Promise<ExclusiveContent[]>;
  
  // Funções de comentários
  getContentComments: (contentId: string) => Promise<ContentComment[]>;
  addComment: (contentId: string, content: string, parentId?: string) => Promise<ContentComment>;
  updateComment: (commentId: string, content: string) => Promise<ContentComment>;
  deleteComment: (commentId: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  unlikeComment: (commentId: string) => Promise<void>;
  
  // Funções de progresso
  updateProgress: (contentId: string, progress: number, position?: number) => Promise<void>;
  getProgress: (contentId: string) => Promise<ContentProgress | null>;
  markAsCompleted: (contentId: string) => Promise<void>;
  
  // Funções de acesso
  checkAccess: (contentId: string) => Promise<{ hasAccess: boolean; reason?: string }>;
  purchaseAccess: (contentId: string, paymentMethod: string) => Promise<void>;
  
  // Funções de estatísticas
  getContentStats: (contentId: string) => Promise<ContentStats>;
  
  // Funções de utilidade
  clearError: () => void;
  setCurrentContent: (content: ExclusiveContent | null) => void;
  searchContents: (query: string, filters?: ContentFilters) => Promise<ExclusiveContent[]>;
}

export interface LiveStreamData {
  id: string;
  title: string;
  description: string;
  streamUrl: string;
  chatUrl?: string;
  isLive: boolean;
  startTime: string;
  endTime?: string;
  maxViewers: number;
  currentViewers: number;
  communityId: string;
  authorId: string;
  accessLevel: 'free' | 'premium' | 'vip' | 'exclusive';
  recordingUrl?: string;
  thumbnailUrl?: string;
}

export interface StreamMessage {
  id: string;
  streamId: string;
  userId: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
  message: string;
  type: 'message' | 'system' | 'donation' | 'reaction';
  timestamp: string;
  metadata?: {
    amount?: number;
    currency?: string;
    reaction?: string;
  };
}