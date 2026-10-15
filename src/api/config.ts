/**
 * Base URL of the Bara backend (Django REST API, docs at `/api/schema/swagger-ui/`).
 * Override per environment with `EXPO_PUBLIC_API_URL` in `.env` (no trailing slash).
 * Same backend and default as the bara-mobile app.
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'https://bara-backend-5g84.onrender.com/api').replace(/\/$/, '');

/**
 * The backend runs on Render's free tier, which sleeps when idle and can take up to a minute
 * to wake up, so requests get a generous timeout.
 */
export const REQUEST_TIMEOUT_MS = 70_000;

/**
 * Email-code sign-in: the first path emails a 6-digit code for `{ email }`, the second trades
 * `{ email, code }` for the same tokens and user as `/auth/login/`. The backend must provide both.
 */
export const LOGIN_CODE_REQUEST_PATH = '/auth/login/request-code/';
export const LOGIN_CODE_VERIFY_PATH = '/auth/login/verify-code/';
