import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { listPayments } from '@/api/admin';
import { LOGIN_CODE_REQUEST_PATH, LOGIN_CODE_VERIFY_PATH } from '@/api/config';
import { ApiError, api, currentRefreshToken, setSessionCallbacks, setSessionTokens, type Tokens } from '@/api/client';
import { readItem, removeItem, writeItem } from '@/api/token-storage';
import type { LoginResponse, MessageResponse, User } from '@/api/types';

/** The refresh token and user are kept on the device so the owner stays signed in. */
const REFRESH_KEY = 'bara.admin.refresh';
const USER_KEY = 'bara.admin.user';
/** With "Remember me", the owner's email and name greet them on the next sign-in. */
const REMEMBER_KEY = 'bara.admin.remember';

export type RememberedAdmin = { email: string; name: string };

type Status = 'loading' | 'signedOut' | 'signedIn';

type Session = {
  status: Status;
  user: User | null;
  remembered: RememberedAdmin | null;
  signIn: (email: string, password: string) => Promise<void>;
  /** Emails a 6-digit sign-in code; resolves with the server's message. */
  requestLoginCode: (email: string) => Promise<string>;
  /** Without `remember`, the session lasts until the app is closed. */
  verifyLoginCode: (email: string, code: string, remember: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string>;
};

const SessionContext = createContext<Session | null>(null);

const persist = (tokens: Tokens, user: User) =>
  Promise.all([writeItem(REFRESH_KEY, tokens.refresh), writeItem(USER_KEY, JSON.stringify(user))]).catch(() => {});

const forget = () => Promise.all([removeItem(REFRESH_KEY), removeItem(USER_KEY)]).catch(() => {});

/** Payment confirmations are Super Admin only, so a 403 means a restaurant account signed in. */
async function assertSuperAdmin() {
  try {
    await listPayments();
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      throw new ApiError(403, 'This account is not a Bara Super Admin. Sign in with the platform owner account.');
    }
    throw error;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [remembered, setRemembered] = useState<RememberedAdmin | null>(null);
  /** False for a session signed in without "Remember me": refreshed tokens stay off the device. */
  const keepOnDevice = useRef(true);

  const clear = useCallback(() => {
    setSessionTokens(null);
    setUser(null);
    setStatus('signedOut');
    forget();
  }, []);

  // Restore the previous session: trade the stored refresh token for a fresh access token.
  useEffect(() => {
    setSessionCallbacks({
      onTokensRefreshed: (tokens) => {
        if (keepOnDevice.current) writeItem(REFRESH_KEY, tokens.refresh).catch(() => {});
      },
      onSessionExpired: clear,
    });
    (async () => {
      const [refresh, storedUser, storedRemember] = await Promise.all([readItem(REFRESH_KEY), readItem(USER_KEY), readItem(REMEMBER_KEY)]);
      try {
        if (storedRemember) setRemembered(JSON.parse(storedRemember) as RememberedAdmin);
      } catch {
        // Corrupt entry: just don't prefill.
      }
      if (!refresh || !storedUser) return setStatus('signedOut');
      try {
        const body = await api.post<Partial<Tokens>>('/auth/refresh/', { refresh }, { auth: false });
        if (!body.access) throw new Error('No access token');
        const tokens = { access: body.access, refresh: body.refresh ?? refresh };
        setSessionTokens(tokens);
        writeItem(REFRESH_KEY, tokens.refresh).catch(() => {});
        setUser(JSON.parse(storedUser) as User);
        setStatus('signedIn');
      } catch {
        clear();
      }
    })().catch(clear);
  }, [clear]);

  // Shared by password and email-code sign-in once the server has issued tokens.
  const finishSignIn = useCallback(async (response: LoginResponse, email: string, remember: boolean) => {
    const tokens = { access: response.access, refresh: response.refresh };
    setSessionTokens(tokens);
    try {
      await assertSuperAdmin();
    } catch (error) {
      setSessionTokens(null);
      api.post('/auth/logout/', { refresh: tokens.refresh }, { auth: false }).catch(() => {});
      throw error;
    }
    keepOnDevice.current = remember;
    if (remember) {
      const admin = { email, name: [response.user.first_name, response.user.last_name].filter(Boolean).join(' ') };
      await persist(tokens, response.user);
      await writeItem(REMEMBER_KEY, JSON.stringify(admin)).catch(() => {});
      setRemembered(admin);
    } else {
      // Keep this session in memory only: an app restart asks for the email and PIN again.
      await Promise.all([forget(), removeItem(REMEMBER_KEY).catch(() => {})]);
      setRemembered(null);
    }
    setUser(response.user);
    setStatus('signedIn');
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    let response: LoginResponse;
    try {
      response = await api.post<LoginResponse>('/auth/login/', { email, password }, { auth: false });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) throw new ApiError(401, 'Wrong email or password. Please try again.');
      throw error;
    }
    await finishSignIn(response, email, true);
  }, [finishSignIn]);

  const requestLoginCode = useCallback(async (email: string) => {
    try {
      const response = await api.post<MessageResponse>(LOGIN_CODE_REQUEST_PATH, { email }, { auth: false });
      return response?.message ?? 'We emailed you a 6-digit code.';
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
        throw new ApiError(error.status, 'Email codes are not switched on for the Bara server yet. Sign in with your password instead.');
      }
      throw error;
    }
  }, []);

  const verifyLoginCode = useCallback(async (email: string, code: string, remember: boolean) => {
    let response: LoginResponse;
    try {
      response = await api.post<LoginResponse>(LOGIN_CODE_VERIFY_PATH, { email, code }, { auth: false });
    } catch (error) {
      if (error instanceof ApiError && (error.status === 400 || error.status === 401)) {
        throw new ApiError(error.status, 'That code is wrong or has expired. Check your email or send a new code.');
      }
      throw error;
    }
    await finishSignIn(response, email, remember);
  }, [finishSignIn]);

  const signOut = useCallback(async () => {
    const refresh = currentRefreshToken();
    try {
      // Blacklist the refresh token on the server; sign out locally even if that fails.
      if (refresh) await api.post('/auth/logout/', { refresh });
    } catch {
      // Offline or already expired.
    }
    clear();
  }, [clear]);

  const requestPasswordReset = useCallback(async (email: string) => {
    const response = await api.post<MessageResponse>('/auth/forgot-password/', { email }, { auth: false });
    return response?.message ?? 'If that email has an account, a reset link is on its way.';
  }, []);

  const value = useMemo(
    () => ({ status, user, remembered, signIn, requestLoginCode, verifyLoginCode, signOut, requestPasswordReset }),
    [status, user, remembered, signIn, requestLoginCode, verifyLoginCode, signOut, requestPasswordReset],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession must be used inside <SessionProvider>');
  return session;
}
