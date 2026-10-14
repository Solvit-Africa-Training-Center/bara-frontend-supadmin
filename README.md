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

## Notes

- Data is mock data held in memory (`src/data/store.tsx`); it resets when the app reloads. Swap the store for API calls once the backend exists.
- Colors and fonts (Ubuntu headings, Inter body) live in `src/theme.ts`, sampled from the Figma frames.
- `archive/` holds earlier screens that were not in the Figma design. It is not part of the app.
