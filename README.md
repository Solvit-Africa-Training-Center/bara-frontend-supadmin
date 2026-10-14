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

| Route | Screen |
| --- | --- |
| `/` | Sign in |
| `/(tabs)` | Home – greeting, platform stats, items needing attention, health, activity |
| `/(tabs)/restaurants` | Restaurants – search, status filters, list |
| `/(tabs)/requests` | Requests – approvals, access, billing issues |
| `/(tabs)/more` | Profile, settings links, sign out |
| `/restaurant/[id]` | Restaurant detail – sales, manager access, approve / suspend |
| `/restaurant/new` | Add restaurant & manager access |

## Notes

- Data is mock data held in memory (`src/data/store.tsx`); it resets when the app reloads. Swap the store for API calls once the backend exists.
- Colors live in `src/theme.ts`, taken from the Bara Figma file.
