// API service for connecting frontend to backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface CreateSessionRequest {
  name: string;
  leaderName?: string;
  leaderPhone?: string;
  durationMs?: number;
}

export interface Session {
  id: string;
  short_id: string;
  name: string;
  leader_name?: string;
  leader_phone?: string;
  leader_member_id?: string;
  created_at: string;
  expires_at: string;
  updated_at: string;
}

export interface CreateMemberRequest {
  name: string;
  phoneNumber?: string;
}

export interface Member {
  id: string;
  session_id: string;
  name: string;
  phone_number?: string;
  role: 'leader' | 'member';
  status: 'joined' | 'present' | 'missing';
  joined_at: string;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateMemberRequest {
  status: 'joined' | 'present' | 'missing';
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Session endpoints
  async createSession(data: CreateSessionRequest): Promise<{ session: Session; leaderMember?: Member }> {
    return this.request<{ session: Session; leaderMember?: Member }>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSessionByShortId(shortId: string): Promise<Session> {
    return this.request<Session>(`/sessions/short/${shortId}`);
  }

  // Member endpoints
  async addMember(sessionId: string, data: CreateMemberRequest): Promise<Member> {
    return this.request<Member>(`/${sessionId}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMemberStatus(
    sessionId: string, 
    memberId: string, 
    data: UpdateMemberRequest
  ): Promise<Member> {
    return this.request<Member>(`/${sessionId}/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Additional endpoints for getting session data
  async getSessionMembers(sessionId: string): Promise<Member[]> {
    return this.request<Member[]>(`/${sessionId}/members`);
  }

  async getSessionWithMembers(shortId: string): Promise<{ session: Session; members: Member[] }> {
    // First get the session by short_id
    const session = await this.getSessionByShortId(shortId);
    // Then get members using the session ID
    const members = await this.getSessionMembers(session.id);
    return { session, members };
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export the class for testing or custom instances
export { ApiService };
