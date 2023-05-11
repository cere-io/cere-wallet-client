import { makeAutoObservable } from 'mobx';
import { OpenloginSessionManager } from '@toruslabs/openlogin-session-manager';
import { UserInfo, getIFrameOrigin } from '@cere-wallet/communication';

type Session = {
  privateKey: string;
  userInfo: UserInfo;
};

export type SessionStoreOptions = {
  sessionNamespace?: string;
};

export type SessionRehydrateOptions = {
  store?: boolean;
};

const getDefaultSessionNamespace = () => {
  try {
    return new URL(getIFrameOrigin()).hostname;
  } catch {
    return undefined;
  }
};

export class SessionStore {
  private sessionManager = new OpenloginSessionManager<Session>({
    sessionNamespace: this.options.sessionNamespace || getDefaultSessionNamespace(),
  });

  private currentSession: Session | null = null;

  constructor(private options: SessionStoreOptions = {}) {
    makeAutoObservable(this);
  }

  get session(): Session | null {
    return this.currentSession;
  }

  private set session(data: Session | null) {
    this.currentSession = data;
  }

  get sessionId() {
    return this.sessionManager.sessionKey;
  }

  get sessionNamespace() {
    return this.sessionManager.sessionNamespace;
  }

  async rehydrate(sessionId?: string, { store = false }: SessionRehydrateOptions = {}) {
    if (sessionId) {
      this.sessionManager.sessionKey = sessionId;
    }

    try {
      this.session = await this.sessionManager.authorizeSession();
    } catch {}

    return this.session;
  }

  async createSession(session: Session, namespace?: string) {
    this.session = session;
    this.sessionManager.sessionKey = OpenloginSessionManager.generateRandomSessionKey();

    if (namespace) {
      this.sessionManager.sessionNamespace = namespace;
    }

    await this.sessionManager.createSession(session);

    return this.sessionManager.sessionKey;
  }

  async invalidateSession() {
    return this.sessionManager.invalidateSession();
  }
}
