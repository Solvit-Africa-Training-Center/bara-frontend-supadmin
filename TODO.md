# Bara Super Admin — API integration status

_Last updated: 16 Oct 2026 · Backend: `https://shirt-shady-daisy.ngrok-free.dev/api` (Swagger at `/api/schema/swagger-ui/`)_

## Summary

| Area | Integrated | Progress |
|---|---|---|
| Screens (12) | 6 live · 2 partly live · 4 sample data | **~58%** `███████░░░░░` |
| Super Admin API endpoints (22) | 14 used by the app | **~64%** `████████░░░░` |
| Sample data sets in `src/data/store.tsx` (6) | 1 replaced (restaurants on Restaurants tab + Home counts) | **~17%** `██░░░░░░░░░░` |
| **Overall (screens, weighted)** | | **≈ 60%** |

Screen % counts a partly live screen as half. Read endpoints were checked with the Postman collection in `postman/` (20/20 checks passed on 16 Oct); the status-change endpoints have **not** been run against real data yet.

## Screens

| Screen | File | Data source | Status |
|---|---|---|---|
| Admin Sign In | `src/app/sign-in.tsx` | `POST /auth/admin/request-pin/` | ✅ Live |
| Verify PIN | `src/app/verify-code.tsx` | `POST /auth/admin/verify-pin/` | ✅ Live |
| Restaurants list | `src/app/(tabs)/restaurants/index.tsx` | `GET /super-admin/restaurants/` | ✅ Live |
| Restaurant detail + status change | `src/app/(tabs)/restaurants/[id].tsx` | list above + `restrict` / `lock` / `extend-grace` / `reactivate` | ✅ Live (status change untested) |
| Requests list | `src/app/(tabs)/requests/index.tsx` | `GET /restaurant/payment-confirmations/` | ✅ Live |
| Request detail (approve / reject) | `src/app/(tabs)/requests/[id].tsx` | `approve` / `reject` + subscription plans | ✅ Live |
| Home dashboard | `src/app/(tabs)/index.tsx` | Active accounts + pending requests live; renewal, support item and "RWF 220,000" billing are sample | 🟡 Partly live |
| More menu | `src/app/(tabs)/more/index.tsx` | Profile + sign out live; hints for Subscriptions/Support are sample | 🟡 Partly live |
| Add restaurant | `src/app/(tabs)/restaurants/new.tsx` | Sample onboarding requests | 🔴 Sample |
| Subscriptions / renewals | `src/app/(tabs)/more/subscriptions.tsx` | Sample restaurants + payments | 🔴 Sample |
| Support (read-only session) | `src/app/(tabs)/more/support.tsx` | Sample support session | 🔴 Sample |
| Reports | `src/app/(tabs)/more/reports.tsx` | Sample billing totals | 🔴 Sample |

## API endpoints

### Used by the app (14)

- [x] `POST /auth/admin/request-pin/` — send PIN
- [x] `POST /auth/admin/verify-pin/` — sign in
- [x] `POST /auth/refresh/` — keep the session alive
- [x] `POST /auth/logout/` — sign out
- [x] `GET /auth/profile/` — dev sign-in bypass only
- [x] `GET /super-admin/restaurants/`
- [x] `POST /super-admin/restaurants/{id}/restrict/`
- [x] `POST /super-admin/restaurants/{id}/lock/`
- [x] `POST /super-admin/restaurants/{id}/extend-grace/`
- [x] `POST /super-admin/restaurants/{id}/reactivate/`
- [x] `GET /restaurant/payment-confirmations/`
- [x] `POST /restaurant/payment-confirmations/{id}/approve/`
- [x] `POST /restaurant/payment-confirmations/{id}/reject/`
- [x] `GET /restaurant/subscription-plans/`

### Available but not used yet (8)

- [ ] `POST /super-admin/restaurants/` — wire up **Add restaurant** (`restaurants/new.tsx`)
- [ ] `GET /super-admin/restaurants/{id}/` — load the detail screen directly (deep links, fresh data)
- [ ] `GET /super-admin/dashboard/summary/` — Home counts (`total_restaurants`, `active_accounts`, `by_status`, `by_tier`, `active_managers`, `pending_requests`, `pending_payments`)
- [ ] `GET /super-admin/managers/` — managers list (the `listManagers` helper exists in `src/api/admin.ts`, unused)
- [ ] `GET /super-admin/managers/{id}/`
- [ ] `GET /restaurant/onboarding-requests/` — "New restaurant" requests (replace sample `requests`)
- [ ] `GET /restaurant/onboarding-requests/{id}/`
- [ ] `POST /restaurant/onboarding-requests/{id}/cancel/`

### Missing on the backend (needed for the remaining sample screens)

- [ ] Archive a restaurant (the app removed "Archive account" because there is no endpoint)
- [ ] Subscription / renewal status per restaurant (paid-through date, overdue days)
- [ ] Billing totals for Home and Reports
- [ ] Support sessions / tickets
- [ ] Last sync and operational flags per restaurant
- [ ] "Resend access instructions" to a manager

## Sample data still in `src/data/store.tsx`

| Data set | Used by | Replace with |
|---|---|---|
| ~~`initialRestaurants`~~ (Restaurants tab, Home counts) | Subscriptions, Support, Reports, Home "needs attention" | ✅ Replaced on Restaurants tab + Home counts; other screens still read it |
| `initialRequests` | Add restaurant | `onboarding-requests` endpoints |
| `initialPayments` (renewals) | Subscriptions, Home, More | Renewal endpoint (missing) or payment confirmations |
| `initialSession` (support) | Support, Home, More | Support endpoint (missing) |
| Billing "RWF 220,000" | Home, Reports | Billing endpoint (missing) or `dashboard/summary` |
| `planFeatures` | Plan cards | `GET /restaurant/subscription-plans/` (`features`) |

## Next steps (in order)

1. [ ] Test status changes (restrict → grace → lock → reactivate) on a **test** restaurant with Postman folder 5.
2. [ ] Wire **Add restaurant** to `POST /super-admin/restaurants/`.
3. [ ] Use `dashboard/summary` on Home and drop the sample billing figure.
4. [ ] Replace sample onboarding requests with `onboarding-requests`.
5. [ ] Use plan features from `subscription-plans` instead of the hard-coded list.
6. [ ] Ask the backend team for the missing endpoints above.
7. [ ] Fix lint error in `src/api/payments.tsx:43` (`react-hooks/set-state-in-effect`).

## Backend issues to report

- [ ] `POST /auth/refresh/` with an invalid/used token returns **500** (`TokenError`) instead of 401.
- [ ] Schema says restaurant `manager` is a string; the API returns an object (`full_name`, `email`, `phone_number`, …) or `null`.
- [ ] `GET /super-admin/managers/?search=<restaurant code>` returns `[]` even when the restaurant has a manager.
- [ ] PIN emails fail with 500 on the Render deployment (`bara-backend-5g84.onrender.com`), likely SMTP.
- [ ] `verify-pin` throttling (429) is strict enough to block a demo after a few attempts.
