import { api } from './api';
import { User } from '../types/userTypes';

// 認證相關的 API 接口
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role?: 'manager' | 'staff';
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  avatar?: string;
}

// 認證服務
export const authService = {
  // 登入
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    
    // 儲存 token 到 localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  // 登出
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // 清除本地儲存的認證資料
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // 註冊新用戶
  register: (userData: RegisterRequest): Promise<User> => {
    return api.post<User>('/auth/register', userData);
  },

  // 刷新 token
  refreshToken: async (): Promise<LoginResponse> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<LoginResponse>('/auth/refresh', {
      refreshToken
    });

    // 更新儲存的 token
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  // 獲取當前用戶資料
  getCurrentUser: (): Promise<User> => {
    return api.get<User>('/auth/me');
  },

  // 更新用戶資料
  updateProfile: (profileData: UpdateProfileRequest): Promise<User> => {
    return api.put<User>('/auth/profile', profileData);
  },

  // 變更密碼
  changePassword: (passwordData: ChangePasswordRequest): Promise<void> => {
    return api.post<void>('/auth/change-password', passwordData);
  },

  // 重設密碼
  resetPassword: (resetData: ResetPasswordRequest): Promise<void> => {
    return api.post<void>('/auth/reset-password', resetData);
  },

  // 驗證 token 是否有效
  validateToken: (): Promise<boolean> => {
    return api.get<boolean>('/auth/validate');
  },

  // 獲取用戶列表（管理員功能）
  getUsers: (params?: {
    page?: number;
    pageSize?: number;
    role?: string;
    search?: string;
  }): Promise<{
    data: User[];
    total: number;
    page: number;
    pageSize: number;
  }> => {
    return api.get('/auth/users', params);
  },

  // 更新用戶角色（管理員功能）
  updateUserRole: (userId: number, role: User['role']): Promise<User> => {
    return api.patch<User>(`/auth/users/${userId}/role`, { role });
  },

  // 禁用/啟用用戶（管理員功能）
  toggleUserStatus: (userId: number, isActive: boolean): Promise<User> => {
    return api.patch<User>(`/auth/users/${userId}/status`, { isActive });
  },

  // 刪除用戶（管理員功能）
  deleteUser: (userId: number): Promise<void> => {
    return api.delete<void>(`/auth/users/${userId}`);
  },

  // 上傳用戶頭像
  uploadAvatar: (imageFile: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('avatar', imageFile);
    
    return api.post<{ avatarUrl: string }>('/auth/avatar', formData);
  },

  // 檢查用戶是否已登入
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // 獲取儲存的用戶資料
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // 獲取儲存的 token
  getStoredToken: (): string | null => {
    return localStorage.getItem('authToken');
  },
};

export default authService; 