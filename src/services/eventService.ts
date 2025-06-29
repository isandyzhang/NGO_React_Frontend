import { api } from './api';

// 活動相關的 API 接口
export interface EventFormData {
  name: string;
  location: string;
  volunteerCount: number;
  participantCount: number;
  shortDescription: string;
  detailDescription: string;
  date: string;
  time: string;
}

export interface EventRecord {
  id: number;
  name: string;
  date: string;
  location: string;
  volunteerCount: number;
  participantCount: number;
  registeredVolunteers: number;
  registeredParticipants: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationRecord {
  id: number;
  eventId: number;
  eventName: string;
  applicantName: string;
  email: string;
  phone: string;
  type: 'volunteer' | 'participant';
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface EventListResponse {
  events: EventRecord[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface EventSearchParams {
  searchType: string;
  searchContent: string;
  status?: EventRecord['status'];
  page?: number;
  pageSize?: number;
}

export interface RegistrationSearchParams {
  searchType: string;
  searchContent: string;
  type?: 'volunteer' | 'participant';
  status?: RegistrationRecord['status'];
  eventId?: number;
  page?: number;
  pageSize?: number;
}

export interface RegistrationListResponse {
  registrations: RegistrationRecord[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

// 活動管理 API 服務
export const eventService = {
  // === 活動管理 ===
  
  // 創建新活動
  createEvent: (eventData: EventFormData): Promise<EventRecord> => {
    return api.post<EventRecord>('/events', eventData);
  },

  // 獲取活動列表
  getEvents: (params?: EventSearchParams): Promise<EventListResponse> => {
    return api.get<EventListResponse>('/events', params);
  },

  // 根據 ID 獲取活動詳情
  getEventById: (id: number): Promise<EventRecord> => {
    return api.get<EventRecord>(`/events/${id}`);
  },

  // 更新活動資料
  updateEvent: (id: number, eventData: Partial<EventFormData>): Promise<EventRecord> => {
    return api.put<EventRecord>(`/events/${id}`, eventData);
  },

  // 刪除活動
  deleteEvent: (id: number): Promise<void> => {
    return api.delete<void>(`/events/${id}`);
  },

  // 更新活動狀態
  updateEventStatus: (id: number, status: EventRecord['status']): Promise<EventRecord> => {
    return api.patch<EventRecord>(`/events/${id}/status`, { status });
  },

  // 搜尋活動
  searchEvents: (params: EventSearchParams): Promise<EventListResponse> => {
    return api.get<EventListResponse>('/events/search', params);
  },

  // 獲取活動統計資料
  getEventStatistics: (): Promise<{
    totalEvents: number;
    upcomingEvents: number;
    ongoingEvents: number;
    completedEvents: number;
    totalRegistrations: number;
  }> => {
    return api.get('/events/statistics');
  },

  // === 報名管理 ===
  
  // 獲取報名列表
  getRegistrations: (params?: RegistrationSearchParams): Promise<RegistrationListResponse> => {
    return api.get<RegistrationListResponse>('/registrations', params);
  },

  // 根據活動 ID 獲取報名列表
  getRegistrationsByEvent: (eventId: number, type?: 'volunteer' | 'participant'): Promise<RegistrationRecord[]> => {
    return api.get<RegistrationRecord[]>(`/events/${eventId}/registrations`, { type });
  },

  // 根據 ID 獲取報名詳情
  getRegistrationById: (id: number): Promise<RegistrationRecord> => {
    return api.get<RegistrationRecord>(`/registrations/${id}`);
  },

  // 創建新報名
  createRegistration: (registrationData: {
    eventId: number;
    applicantName: string;
    email: string;
    phone: string;
    type: 'volunteer' | 'participant';
    description: string;
  }): Promise<RegistrationRecord> => {
    return api.post<RegistrationRecord>('/registrations', registrationData);
  },

  // 審核報名 - 同意
  approveRegistration: (id: number, reviewNote?: string): Promise<RegistrationRecord> => {
    return api.patch<RegistrationRecord>(`/registrations/${id}/approve`, { reviewNote });
  },

  // 審核報名 - 拒絕
  rejectRegistration: (id: number, reviewNote?: string): Promise<RegistrationRecord> => {
    return api.patch<RegistrationRecord>(`/registrations/${id}/reject`, { reviewNote });
  },

  // 批量審核報名
  batchReviewRegistrations: (registrationIds: number[], action: 'approve' | 'reject', reviewNote?: string): Promise<RegistrationRecord[]> => {
    return api.patch<RegistrationRecord[]>('/registrations/batch-review', {
      registrationIds,
      action,
      reviewNote
    });
  },

  // 搜尋報名
  searchRegistrations: (params: RegistrationSearchParams): Promise<RegistrationListResponse> => {
    return api.get<RegistrationListResponse>('/registrations/search', params);
  },

  // 獲取待審核報名數量
  getPendingRegistrationsCount: (): Promise<{
    totalPending: number;
    volunteerPending: number;
    participantPending: number;
  }> => {
    return api.get('/registrations/pending-count');
  },

  // 匯出報名名單
  exportRegistrations: (eventId: number, type?: 'volunteer' | 'participant'): Promise<Blob> => {
    return api.get(`/events/${eventId}/registrations/export`, { type });
  },
};

export default eventService; 