// API 응답 타입들
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// 인증 관련 타입
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  age?: number | null;
  gender?: string | null;
  bio?: string | null;
  interests?: string[];
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}


// 에러 타입
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// 페이지네이션 타입
export interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

