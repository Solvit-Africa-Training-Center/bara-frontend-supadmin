import { Platform } from 'react-native';

/**
 * Base URL of the Bara backend (Django REST API, docs at `/api/schema/swagger-ui/`).
 * Override per environment with `EXPO_PUBLIC_API_URL` in `.env` (no trailing slash).
 * The default is the backend team's ngrok server, the one with Super Admin PIN sign-in.
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'https://shirt-shady-daisy.ngrok-free.dev/api').replace(/\/$/, '');

/**
 * Where requests actually go. In development on web, an ngrok backend is reached through the
 * dev server's `/api-proxy` (see metro.config.js), because ngrok blocks browser GET requests.
 */
export const REQUEST_BASE_URL =
  __DEV__ && Platform.OS === 'web' && API_URL.includes('ngrok') && typeof window !== 'undefined'
    ? `${window.location.origin}/api-proxy`
    : API_URL;

/**
 * The backend can be slow to answer (a sleeping free server or a busy tunnel) and take up to a minute
 * to respond, so requests get a generous timeout.
 */
export const REQUEST_TIMEOUT_MS = 70_000;

/**
 * Super Admin PIN sign-in: the first path emails a 6-digit PIN for `{ email }`, the second trades
 * `{ email, pin }` for the same tokens and user as `/auth/login/`.
 */
export const LOGIN_CODE_REQUEST_PATH = '/auth/admin/request-pin/';
export const LOGIN_CODE_VERIFY_PATH = '/auth/admin/verify-pin/';
