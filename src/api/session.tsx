import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { listPayments } from '@/api/admin';
import { ApiError, api, currentRefreshToken, setSessionCallbacks, setSessionTokens, type Tokens } from '@/api/client';
import { readItem, removeItem, writeItem } from '@/api/token-storage';
import type { LoginResponse, MessageResponse, User } from '@/api/types';

/** The refresh token and user are kept on the device so the owner stays signed in. */
const REFRESH_KEY = 'bara.admin.refresh';
const USER_KEY = 'bara.admin.user';

type Status = 'loading' | 'signedOut' | 'signedIn';

type Session = {
  status: Status;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
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

  const clear = useCallback(() => {
    setSessionTokens(null);
    setUser(null);
    setStatus('signedOut');
    forget();
  }, []);

  // Restore the previous session: trade the stored refresh token for a fresh access token.
  useEffect(() => {
    setSessionCallbacks({
      onTokensRefreshed: (tokens) => writeItem(REFRESH_KEY, tokens.refresh).catch(() => {}),
      onSessionExpired: clear,
    });
    (async () => {
      const [refresh, storedUser] = await Promise.all([readItem(REFRESH_KEY), readItem(USER_KEY)]);
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

  const signIn = useCallback(async (email: string, password: string) => {
    let response: LoginResponse;
    try {
      response = await api.post<LoginResponse>('/auth/login/', { email, password }, { auth: false });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) throw new ApiError(401, 'Wrong email or password. Please try again.');
      throw error;
    }
    const tokens = { access: response.access, refresh: response.refresh };
    setSessionTokens(tokens);
    try {
      await assertSuperAdmin();
    } catch (error) {
      setSessionTokens(null);
      api.post('/auth/logout/', { refresh: tokens.refresh }, { auth: false }).catch(() => {});
      throw error;
    }
    await persist(tokens, response.user);
    setUser(response.user);
    setStatus('signedIn');
  }, []);

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

  const value = useMemo(() => ({ status, user, signIn, signOut, requestPasswordReset }), [status, user, signIn, signOut, requestPasswordReset]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession must be used inside <SessionProvider>');
  return session;
}
