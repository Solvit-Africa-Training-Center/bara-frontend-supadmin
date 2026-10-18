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

/**
 * DEV ONLY sign-in bypass (for demos when PIN email or throttling gets in the way): a Super Admin
 * refresh token from `EXPO_PUBLIC_DEV_REFRESH_TOKEN`. The backend rotates refresh tokens, so the newest
 * one is kept under DEV_KEY, and signing out of a dev session does not blacklist it.
 */
const DEV_REFRESH_TOKEN = __DEV__ ? process.env.EXPO_PUBLIC_DEV_REFRESH_TOKEN?.trim() || null : null;
const DEV_KEY = 'bara.admin.dev-refresh';
export const devSignInAvailable = __DEV__ || !!DEV_REFRESH_TOKEN;

export const DEV_ADMIN_USER: User = {
  id: 'admin-derrick',
  first_name: 'Derrick',
  last_name: 'Mugisha',
  email: 'derrick@bara.rw',
  restaurant: null,
};

export const DEV_TOKENS: Tokens = {
  access: 'dev-bypass-access-token',
  refresh: 'dev-bypass-refresh-token',
};

export type RememberedAdmin = { email: string; name: string };

type Status = 'loading' | 'signedOut' | 'signedIn';

type Session = {
  status: Status;
  user: User | null;
  remembered: RememberedAdmin | null;
  /** Emails a 6-digit sign-in code; resolves with the server's message. */
  requestLoginCode: (email: string) => Promise<string>;
  /** Without `remember`, the session lasts until the app is closed. */
  verifyLoginCode: (email: string, code: string, remember: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  /** DEV ONLY: sign in with EXPO_PUBLIC_DEV_REFRESH_TOKEN, skipping the emailed PIN. */
  devSignIn: () => Promise<void>;
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
  /** True while signed in through the dev bypass. */
  const devSession = useRef(false);

  const saveRefresh = useCallback((refresh: string) => {
    if (keepOnDevice.current) writeItem(REFRESH_KEY, refresh).catch(() => {});
    if (devSession.current) writeItem(DEV_KEY, refresh).catch(() => {});
  }, []);

  const clear = useCallback(() => {
    setSessionTokens(null);
    setUser(null);
    setStatus('signedOut');
    devSession.current = false;
    forget();
  }, []);

  // Restore the previous session: trade the stored refresh token for a fresh access token.
  useEffect(() => {
    setSessionCallbacks({
      onTokensRefreshed: (tokens) => saveRefresh(tokens.refresh),
      onSessionExpired: () => {
        if (!devSession.current) clear();
      },
    });
    (async () => {
      const [refresh, storedUser, storedRemember] = await Promise.all([readItem(REFRESH_KEY), readItem(USER_KEY), readItem(REMEMBER_KEY)]);
      try {
        if (storedRemember) setRemembered(JSON.parse(storedRemember) as RememberedAdmin);
      } catch {
        // Corrupt entry: just don't prefill.
      }
      if (!refresh || !storedUser) return setStatus('signedOut');
      if (refresh.startsWith('dev-')) {
        devSession.current = true;
        setSessionTokens(DEV_TOKENS);
        try {
          setUser(JSON.parse(storedUser) as User);
        } catch {
          setUser(DEV_ADMIN_USER);
        }
        return setStatus('signedIn');
      }
      devSession.current = !!DEV_REFRESH_TOKEN && refresh === (await readItem(DEV_KEY));
      try {
        const body = await api.post<Partial<Tokens>>('/auth/refresh/', { refresh }, { auth: false });
        if (!body.access) throw new Error('No access token');
        const tokens = { access: body.access, refresh: body.refresh ?? refresh };
        setSessionTokens(tokens);
        saveRefresh(tokens.refresh);
        setUser(JSON.parse(storedUser) as User);
        setStatus('signedIn');
      } catch {
        clear();
      }
    })().catch(clear);
  }, [clear, saveRefresh]);

  // Runs once the server has accepted the emailed PIN and issued tokens.
  const finishSignIn = useCallback(async (response: LoginResponse, email: string, remember: boolean) => {
    const tokens = { access: response.access, refresh: response.refresh };
    setSessionTokens(tokens);
    if (!tokens.access.startsWith('dev-')) {
      try {
        await assertSuperAdmin();
      } catch (error) {
        setSessionTokens(null);
        api.post('/auth/logout/', { refresh: tokens.refresh }, { auth: false }).catch(() => {});
        throw error;
      }
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

  const requestLoginCode = useCallback(async (email: string) => {
    try {
      const response = await api.post<MessageResponse>(LOGIN_CODE_REQUEST_PATH, { email }, { auth: false });
      return response?.message ?? 'We emailed you a 6-digit code.';
    } catch (error) {
      if (__DEV__) {
        console.warn('[DEV] Backend PIN request failed (endpoint not working). Bypassing in dev mode.');
        return 'Dev mode: enter any 6-digit PIN (e.g. 123456) to sign in.';
      }
      if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
        throw new ApiError(error.status, 'The Bara server could not send a PIN.');
      }
      throw error;
    }
  }, []);

  const verifyLoginCode = useCallback(
    async (email: string, code: string, remember: boolean) => {
      let response: LoginResponse | null = null;
      try {
        response = await api.post<LoginResponse>(LOGIN_CODE_VERIFY_PATH, { email, pin: code }, { auth: false });
      } catch (error) {
        if (__DEV__) {
          console.warn('[DEV] Backend PIN verification failed. Signing in with dev Super Admin bypass.');
          const nameParts = (remembered?.email === email ? remembered.name : email.split('@')[0])
            .split(/[\s._-]+/)
            .filter(Boolean);
          const first = nameParts[0] ? nameParts[0][0].toUpperCase() + nameParts[0].slice(1) : 'Derrick';
          const last = nameParts[1] ? nameParts[1][0].toUpperCase() + nameParts[1].slice(1) : 'Mugisha';
          const devUser: User = {
            id: 'admin-dev',
            first_name: first,
            last_name: last,
            email,
            restaurant: null,
          };
          devSession.current = true;
          await finishSignIn(
            { message: 'Dev sign-in', access: DEV_TOKENS.access, refresh: DEV_TOKENS.refresh, user: devUser },
            email,
            remember,
          );
          return;
        }
        if (error instanceof ApiError && (error.status === 400 || error.status === 401)) {
          throw new ApiError(error.status, 'That PIN is wrong or has expired. Check your email or send a new PIN.');
        }
        throw error;
      }
      if (response) {
        await finishSignIn(response, email, remember);
      }
    },
    [finishSignIn, remembered],
  );

  const signOut = useCallback(async () => {
    const refresh = currentRefreshToken();
    try {
      // Blacklist the refresh token on the server; sign out locally even if that fails.
      // A dev session keeps its token alive so "Skip sign-in (dev)" keeps working.
      if (refresh && !devSession.current) await api.post('/auth/logout/', { refresh });
    } catch {
      // Offline or already expired.
    }
    clear();
  }, [clear]);

  const devSignIn = useCallback(async () => {
    if (DEV_REFRESH_TOKEN) {
      const candidates = [await readItem(DEV_KEY).catch(() => null), DEV_REFRESH_TOKEN].filter(
        (t, i, all): t is string => !!t && all.indexOf(t) === i,
      );
      for (const refresh of candidates) {
        let body: Partial<Tokens>;
        try {
          body = await api.post<Partial<Tokens>>('/auth/refresh/', { refresh }, { auth: false });
        } catch {
          continue; // Used up or expired: try the next one.
        }
        if (!body.access) continue;
        const tokens = { access: body.access, refresh: body.refresh ?? refresh };
        devSession.current = true;
        keepOnDevice.current = true;
        setSessionTokens(tokens);
        await writeItem(DEV_KEY, tokens.refresh).catch(() => {});
        const profile = await api.get<User>('/auth/profile/').catch(() => DEV_ADMIN_USER);
        await persist(tokens, profile);
        setUser(profile);
        setStatus('signedIn');
        return;
      }
    }
    // Dev bypass when no working backend refresh token:
    devSession.current = true;
    keepOnDevice.current = true;
    setSessionTokens(DEV_TOKENS);
    await persist(DEV_TOKENS, DEV_ADMIN_USER);
    const admin = { email: DEV_ADMIN_USER.email!, name: `${DEV_ADMIN_USER.first_name} ${DEV_ADMIN_USER.last_name}` };
    await writeItem(REMEMBER_KEY, JSON.stringify(admin)).catch(() => {});
    setRemembered(admin);
    setUser(DEV_ADMIN_USER);
    setStatus('signedIn');
  }, []);

  const value = useMemo(
    () => ({ status, user, remembered, requestLoginCode, verifyLoginCode, signOut, devSignIn }),
    [status, user, remembered, requestLoginCode, verifyLoginCode, signOut, devSignIn],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession must be used inside <SessionProvider>');
  return session;
}
