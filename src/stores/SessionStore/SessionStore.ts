import { makeAutoObservable } from 'mobx';
import { UserInfo, getIFrameOrigin } from '@cere-wallet/communication';

import { AUTH_SESSION_TIMEOUT } from '~/constants';
import { reportError } from '~/reporting';

export type Session = {
  privateKey: string;
  userInfo: UserInfo;
};

export type SessionStoreOptions = {
  sessionNamespace?: string;
};

export type SessionCreateOptions = {
  store?: boolean;
  namespace?: string;
};

const getDefaultSessionNamespace = () => {
  try {
    return new URL(getIFrameOrigin()).hostname;
  } catch {
    return undefined;
  }
};

// Simple session manager to replace the deprecated OpenLogin session manager
class SimpleSessionManager {
  private _sessionId: string | null = null;
  private _sessionNamespace: string;
  private sessionData: Session | null = null;

  constructor(sessionNamespace: string, private sessionTimeout: number = AUTH_SESSION_TIMEOUT) {
    this._sessionNamespace = sessionNamespace;
  }

  get sessionId() {
    return this._sessionId;
  }

  set sessionId(id: string | null) {
    this._sessionId = id;
  }

  get sessionNamespace() {
    return this._sessionNamespace;
  }

  set sessionNamespace(namespace: string) {
    this._sessionNamespace = namespace;
  }

  generateRandomSessionKey(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  async createSession(data: Session): Promise<void> {
    this.sessionData = data;
    const sessionKey = `session_${this._sessionNamespace}_${this._sessionId}`;
    const sessionInfo = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.sessionTimeout * 1000,
    };

    try {
      localStorage.setItem(sessionKey, JSON.stringify(sessionInfo));
    } catch (error) {
      reportError(error);
      throw new Error('Failed to create session');
    }
  }

  async authorizeSession(): Promise<Session> {
    if (!this._sessionId) {
      throw new Error('No session ID provided');
    }

    const sessionKey = `session_${this._sessionNamespace}_${this._sessionId}`;

    try {
      const storedSession = localStorage.getItem(sessionKey);
      if (!storedSession) {
        throw new Error('Session not found');
      }

      const sessionInfo = JSON.parse(storedSession);

      // Check if session has expired
      if (Date.now() > sessionInfo.expiresAt) {
        localStorage.removeItem(sessionKey);
        throw new Error('Session expired');
      }

      this.sessionData = sessionInfo.data;
      return sessionInfo.data;
    } catch (error) {
      throw new Error('Invalid or expired session');
    }
  }

  async invalidateSession(): Promise<void> {
    if (this._sessionId) {
      const sessionKey = `session_${this._sessionNamespace}_${this._sessionId}`;
      try {
        localStorage.removeItem(sessionKey);
      } catch (error) {
        reportError(error);
      }
    }
    this.sessionData = null;
    this._sessionId = null;
  }
}

// Simple browser storage implementation
class SimpleBrowserStorage {
  constructor(private storageKey: string, private storageType: 'local' | 'session' = 'local') {}

  static getInstance(storageKey: string, storageType: 'local' | 'session' = 'local') {
    return new SimpleBrowserStorage(storageKey, storageType);
  }

  get<T>(key: string): T | undefined {
    try {
      const storage = this.storageType === 'local' ? localStorage : sessionStorage;
      const fullKey = `${this.storageKey}_${key}`;
      const value = storage.getItem(fullKey);
      return value ? JSON.parse(value) : undefined;
    } catch (error) {
      reportError(error);
      return undefined;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      const storage = this.storageType === 'local' ? localStorage : sessionStorage;
      const fullKey = `${this.storageKey}_${key}`;
      storage.setItem(fullKey, JSON.stringify(value));
    } catch (error) {
      reportError(error);
    }
  }

  resetStore(): void {
    try {
      const storage = this.storageType === 'local' ? localStorage : sessionStorage;
      const keys = Object.keys(storage).filter((key) => key.startsWith(this.storageKey));
      keys.forEach((key) => storage.removeItem(key));
    } catch (error) {
      reportError(error);
    }
  }
}

export class SessionStore {
  private storage: SimpleBrowserStorage;
  private sessionManager: SimpleSessionManager;
  private currentSession: Session | null = null;

  constructor(private options: SessionStoreOptions = {}) {
    makeAutoObservable(this, {
      sessionId: false,
      sessionNamespace: false,
    });

    const sessionNamespace = this.options.sessionNamespace || getDefaultSessionNamespace() || 'default';
    const storageKey = `cw-session-${sessionNamespace}`;

    this.sessionManager = new SimpleSessionManager(sessionNamespace, AUTH_SESSION_TIMEOUT);
    this.storage = SimpleBrowserStorage.getInstance(storageKey, 'local');
  }

  get session(): Session | null {
    return this.currentSession;
  }

  private set session(data: Session | null) {
    this.currentSession = data;
  }

  get sessionId() {
    return this.sessionManager.sessionId;
  }

  get sessionNamespace() {
    return this.sessionManager.sessionNamespace;
  }

  async rehydrate(sessionId?: string) {
    const storedSessionId = this.storage.get<string | undefined>('sessionId');
    const currentSessionId = sessionId || storedSessionId;

    if (!currentSessionId) {
      return null;
    }

    this.sessionManager.sessionId = currentSessionId;

    try {
      this.session = await this.sessionManager.authorizeSession();

      if (storedSessionId !== currentSessionId) {
        await this.storeSession();
      }
    } catch (error) {
      console.warn('The session is invalid or expired', error);

      this.resetSession();
    }

    return this.session;
  }

  async createSession(session: Session, { namespace, store = false }: SessionCreateOptions = {}) {
    this.session = session;
    this.sessionManager.sessionId = this.sessionManager.generateRandomSessionKey();

    if (namespace) {
      this.sessionManager.sessionNamespace = namespace;
    }

    await this.sessionManager.createSession(session);

    if (store) {
      await this.storeSession();
    }

    return this.sessionId;
  }

  async storeSession() {
    try {
      this.storage.set('sessionId', this.sessionId);
    } catch (error) {
      reportError(error);
    }
  }

  private resetSession() {
    this.session = null;
    this.storage.resetStore();
  }

  async invalidateSession() {
    try {
      await this.sessionManager.invalidateSession();
    } catch (error) {
      reportError(error);
    }

    this.resetSession();
  }

  saveState<T = any>(name: string, state: T) {
    if (!this.sessionId) {
      return;
    }

    this.storage.set(name, state);
  }

  getState<T = any>(name: string) {
    return this.sessionId ? this.storage.get<T>(name) : undefined;
  }
}
