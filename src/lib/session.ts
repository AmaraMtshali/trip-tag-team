import { TripSession, Member, SessionStore } from '@/types/session';

const STORAGE_KEY = 'bus-buddy-sessions';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function generateMemberId(): string {
  return Math.random().toString(36).substring(2, 8);
}

export function createSession(name: string): TripSession {
  const sessionId = generateSessionId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION);
  
  const session: TripSession = {
    id: sessionId,
    name,
    createdAt: now,
    expiresAt,
    members: [],
    leaderCode: sessionId,
    checkInUrl: `${window.location.origin}/join/${sessionId}`,
    checkOutUrl: `${window.location.origin}/checkout/${sessionId}`
  };

  saveSession(session);
  return session;
}

export function getSessionStore(): SessionStore {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { sessions: {}, currentSessionId: null };
    }
    
    const store: SessionStore = JSON.parse(stored);
    
    // Clean up expired sessions
    const now = new Date();
    Object.keys(store.sessions).forEach(sessionId => {
      const session = store.sessions[sessionId];
      if (new Date(session.expiresAt) < now) {
        delete store.sessions[sessionId];
        if (store.currentSessionId === sessionId) {
          store.currentSessionId = null;
        }
      }
    });
    
    return store;
  } catch {
    return { sessions: {}, currentSessionId: null };
  }
}

export function saveSession(session: TripSession): void {
  const store = getSessionStore();
  store.sessions[session.id] = session;
  store.currentSessionId = session.id;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getSession(sessionId: string): TripSession | null {
  const store = getSessionStore();
  return store.sessions[sessionId] || null;
}

export function addMember(sessionId: string, name: string): Member | null {
  const session = getSession(sessionId);
  if (!session) return null;

  // Check if member already exists
  const existingMember = session.members.find(m => m.name.toLowerCase() === name.toLowerCase());
  if (existingMember) {
    existingMember.status = 'present';
    existingMember.lastActivity = new Date();
    saveSession(session);
    return existingMember;
  }

  const member: Member = {
    id: generateMemberId(),
    name,
    joinedAt: new Date(),
    status: 'joined',
    lastActivity: new Date()
  };

  session.members.push(member);
  saveSession(session);
  return member;
}

export function updateMemberStatus(sessionId: string, memberId: string, status: Member['status']): boolean {
  const session = getSession(sessionId);
  if (!session) return false;

  const member = session.members.find(m => m.id === memberId);
  if (!member) return false;

  member.status = status;
  member.lastActivity = new Date();
  saveSession(session);
  return true;
}

export function getMemberStats(session: TripSession) {
  const total = session.members.length;
  const present = session.members.filter(m => m.status === 'present' || m.status === 'joined').length;
  const missing = session.members.filter(m => m.status === 'missing').length;
  
  return { total, present, missing };
}