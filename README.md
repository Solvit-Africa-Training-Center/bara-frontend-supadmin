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
| PIN sign-in / stay signed in / sign out | `/auth/admin/request-pin/`, `/auth/admin/verify-pin/`, `/auth/refresh/`, `/auth/logout/` | Live |
| Requests list (payment confirmations) | `GET /restaurant/payment-confirmations/` | Live |
| Approve / reject a payment | `POST /restaurant/payment-confirmations/{id}/approve/` · `/reject/` | Live |
| Subscription plan catalog | `GET /restaurant/subscription-plans/` | Live |
| Restaurants and account status actions | `/super-admin/restaurants/` and `/super-admin/restaurants/{id}/{action}/` | Live |
| Restaurant onboarding requests | `GET /restaurant/onboarding-requests/` | Live, read-only for Super Admin |
| Subscription overview | Restaurants, plan catalog, and payment confirmations | Live |
| Reports | Live restaurant, plan, and payment counts | Live overview; no platform billing totals |
| Support tickets and sessions | — | Not available in the current API |

Only Super Admin accounts can sign in: after login the app calls `/restaurant/payment-confirmations/`,
and a 403 means the account is a restaurant account. Live API requests show errors instead of falling
back to sample records when the backend is unavailable.

The Render server sleeps when idle, so the first request can take up to a minute.

## Notes

- Restaurant creation creates a restaurant record only. The current API does not create a manager account or send an invitation.
- Onboarding requests are listed for visibility; the API does not expose a Super Admin approval action.
- The reports overview uses live restaurant, plan, and payment-confirmation data. The API does not expose platform billing totals, revenue history, or operational flags.
- Support is not connected because the API does not expose support tickets, inspection sessions, or messaging.
- Colors and fonts (Ubuntu headings, Inter body) live in `src/theme.ts`, sampled from the Figma frames.
- `archive/` holds earlier screens that were not in the Figma design. It is not part of the app.
