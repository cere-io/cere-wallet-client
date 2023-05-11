import { makeAutoObservable } from 'mobx';
import { OpenloginSessionManager } from '@toruslabs/openlogin-session-manager';
import { BrowserStorage } from '@toruslabs/openlogin-utils';
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

export class SessionStore {
  private storage = BrowserStorage.getInstance('cw-session', 'local');
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
    const resultSessionId = sessionId || this.storage.get<string | undefined>('sessionId');

    if (!resultSessionId) {
      return null;
    }

    this.sessionManager.sessionKey = resultSessionId;

    try {
      this.session = await this.sessionManager.authorizeSession();
    } catch {
      this.sessionManager.sessionKey = '';
    }

    if (store) {
      this.storage.set('sessionId', this.sessionId);
    }

    return this.session;
  }

  async createSession(session: Session, { namespace, store }: SessionCreateOptions = {}) {
    this.session = session;
    this.sessionManager.sessionKey = OpenloginSessionManager.generateRandomSessionKey();

    if (namespace) {
      this.sessionManager.sessionNamespace = namespace;
    }

    await this.sessionManager.createSession(session);

    if (store) {
      this.storage.set('sessionId', this.sessionId);
    }

    return this.sessionId;
  }

  async invalidateSession() {
    try {
      await this.sessionManager.invalidateSession();
    } catch (error) {
      console.error(error);
    }

    this.storage.resetStore();
    this.session = null;
  }
}
