# Bara Super Admin

Mobile app (Expo / React Native) for Bara platform staff to manage every restaurant on Bara.

## Run it

```bash
npm install
npx expo start
```

- **On your phone:** install **Expo Go** (Play Store / App Store) and scan the QR code shown in the terminal.
- **In the browser:** press `w` in the terminal.

## Screens

Built from the Figma section **"Bara SUPER ADMIN — Mobile app"** (page *Bara App*).

| Tab | Route | Figma frame |
| --- | --- | --- |
| Home | `/` | Good morning, Derrick |
| Restaurants | `/restaurants` | Restaurants |
| Restaurants | `/restaurants/[id]` | Kigali Heights (restaurant detail) |
| Restaurants | `/restaurants/new` | Add restaurant & manager access |
| Requests | `/requests` | Requests |
| Requests | `/requests/[id]` | Review request |
| More | `/more` | *(not in Figma – menu for the three pages below)* |
| More | `/more/subscriptions` | Subscription & payment |
| More | `/more/support` | Support inspection |
| More | `/more/reports` | Platform reports |

## Backend API

The app talks to the Bara Django API (same backend as `bara-mobile`):
`https://bara-backend-5g84.onrender.com/api` · docs at `/api/schema/swagger-ui/`.
To use another server, copy `.env.example` to `.env` and change `EXPO_PUBLIC_API_URL`.

| Feature | Endpoint | Status |
| --- | --- | --- |
| Sign in / stay signed in / sign out | `/auth/login/`, `/auth/refresh/`, `/auth/logout/` | Live |
| Forgot password | `/auth/forgot-password/` | Live |
| Requests list (payment confirmations) | `GET /payment-confirmations/` | Live |
| Approve / reject a payment | `POST /payment-confirmations/{id}/approve/` · `/reject/` | Live |
| Plan features on Review request | `GET /subscription-plans/` | Live |
| Restaurants, Subscriptions, Support, Reports | — | Sample data (no endpoint yet, marked in the app) |

Only Super Admin accounts can sign in: after login the app calls `/payment-confirmations/`,
and a 403 means the account is a restaurant account.

The Render server sleeps when idle, so the first request can take up to a minute.

## Notes

- Screens without an API endpoint use sample data from `src/data/store.tsx`; it resets when the app reloads.
- Colors and fonts (Ubuntu headings, Inter body) live in `src/theme.ts`, sampled from the Figma frames.
- `archive/` holds earlier screens that were not in the Figma design. It is not part of the app.
