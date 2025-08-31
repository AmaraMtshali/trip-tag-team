import { TripSession, Member, SessionStore } from '@/types/session';

const STORAGE_KEY = 'bus-buddy-sessions';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function generateMemberId(): string {
  return Math.random().toString(36).substring(2, 8);
}

// Robust URL generation for deployment
function getBaseUrl(): string {
  // Try multiple methods to get the correct base URL
  if (typeof window !== 'undefined') {
    // Method 1: Use window.location.origin (most reliable)
    if (window.location.origin) {
      return window.location.origin;
    }
    
    // Method 2: Construct from protocol and host
    if (window.location.protocol && window.location.host) {
      return `${window.location.protocol}//${window.location.host}`;
    }
    
    // Method 3: Use hostname and port
    if (window.location.hostname) {
      const protocol = window.location.protocol || 'https:';
      const port = window.location.port ? `:${window.location.port}` : '';
      return `${protocol}//${window.location.hostname}${port}`;
    }
  }
  
  // Fallback for server-side rendering or edge cases
  return 'https://your-deployed-domain.com';
}

export function createSession(name: string, leaderName?: string, leaderPhone?: string): TripSession {
  const sessionId = generateSessionId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION);
  
  const baseUrl = getBaseUrl();
  
  const session: TripSession = {
    id: sessionId,
    name,
    createdAt: now,
    expiresAt,
    members: [],
    leaderCode: sessionId,
    leaderName,
    checkInUrl: `${baseUrl}/join/${sessionId}`,
    checkOutUrl: `${baseUrl}/checkout/${sessionId}`
  };

  if (leaderName && leaderName.trim()) {
    const leaderMember: Member = {
      id: generateMemberId(),
      name: leaderName.trim(),
      phoneNumber: leaderPhone?.trim(),
      joinedAt: now,
      status: 'present',
      lastActivity: now,
      role: 'leader'
    };
    session.members.push(leaderMember);
    session.leaderMemberId = leaderMember.id;
  }

  saveSession(session);
  return session;
}

export function getSessionStore(): SessionStore {
  try {
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage is not available');
      return { sessions: {}, currentSessionId: null };
    }
    
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
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return { sessions: {}, currentSessionId: null };
  }
}

export function saveSession(session: TripSession): void {
  try {
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
      console.error('localStorage is not available');
      return;
    }
    
    const store = getSessionStore();
    store.sessions[session.id] = session;
    store.currentSessionId = session.id;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error('Error saving session to localStorage:', error);
    // Fallback: try to save just this session
    try {
      const fallbackStore = { sessions: { [session.id]: session }, currentSessionId: session.id };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackStore));
    } catch (fallbackError) {
      console.error('Fallback save also failed:', fallbackError);
    }
  }
}

export function getSession(sessionId: string): TripSession | null {
  try {
    const store = getSessionStore();
    return store.sessions[sessionId] || null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export function addMember(sessionId: string, name: string, phoneNumber?: string): Member | null {
  try {
    const session = getSession(sessionId);
    if (!session) return null;

    // Check if member already exists
    const existingMember = session.members.find(m => m.name.toLowerCase() === name.toLowerCase());
    if (existingMember) {
      existingMember.status = 'present';
      existingMember.lastActivity = new Date();
      // Update phone number if provided
      if (phoneNumber?.trim()) {
        existingMember.phoneNumber = phoneNumber.trim();
      }
      saveSession(session);
      return existingMember;
    }

    const member: Member = {
      id: generateMemberId(),
      name,
      phoneNumber: phoneNumber?.trim(),
      joinedAt: new Date(),
      status: 'joined',
      lastActivity: new Date()
    };

    session.members.push(member);
    saveSession(session);
    return member;
  } catch (error) {
    console.error('Error adding member:', error);
    return null;
  }
}

export function updateMemberStatus(sessionId: string, memberId: string, status: Member['status']): boolean {
  try {
    const session = getSession(sessionId);
    if (!session) return false;

    const member = session.members.find(m => m.id === memberId);
    if (!member) return false;

    member.status = status;
    member.lastActivity = new Date();
    saveSession(session);
    return true;
  } catch (error) {
    console.error('Error updating member status:', error);
    return false;
  }
}

export function getMemberStats(session: TripSession) {
  const total = session.members.length;
  const present = session.members.filter(m => m.status === 'present' || m.status === 'joined').length;
  const missing = session.members.filter(m => m.status === 'missing').length;
  
  return { total, present, missing };
}

// Debug function to help identify deployment issues
export function debugSessionInfo(sessionId: string) {
  try {
    const session = getSession(sessionId);
    if (!session) {
      console.error('Session not found:', sessionId);
      return null;
    }
    
    const debugInfo = {
      sessionId: session.id,
      name: session.name,
      checkInUrl: session.checkInUrl,
      checkOutUrl: session.checkOutUrl,
      currentOrigin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
      currentProtocol: typeof window !== 'undefined' ? window.location.protocol : 'N/A',
      currentHost: typeof window !== 'undefined' ? window.location.host : 'N/A',
      localStorageAvailable: typeof localStorage !== 'undefined',
      membersCount: session.members.length,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      baseUrl: getBaseUrl()
    };
    
    console.log('Session Debug Info:', debugInfo);
    console.log('QR Code URLs:', {
      checkIn: session.checkInUrl,
      checkOut: session.checkOutUrl
    });
    
    return session;
  } catch (error) {
    console.error('Debug error:', error);
    return null;
  }
}