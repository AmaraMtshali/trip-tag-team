export interface Member {
  id: string;
  name: string;
  joinedAt: Date;
  status: 'joined' | 'missing' | 'present';
  lastActivity: Date;
}

export interface TripSession {
  id: string;
  name: string;
  createdAt: Date;
  expiresAt: Date;
  members: Member[];
  leaderCode: string;
  checkInUrl: string;
  checkOutUrl?: string;
}

export interface SessionStore {
  sessions: Record<string, TripSession>;
  currentSessionId: string | null;
}