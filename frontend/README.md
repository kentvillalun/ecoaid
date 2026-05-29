# ECOPROFIT Frontend

This frontend is the resident and barangay web interface for the ECOPROFIT system.

## Current Status

The frontend is feature-complete for all currently implemented modules. Both resident and barangay sides are connected to the backend end-to-end.

### Resident side

- Onboarding flow (redesigned v2.0 — new illustrations, horizontal slide animation, haptic feedback)
- Login with animated bottom-sheet card design and splash screen (Android skips splash)
- Signup with barangay autocomplete and sitio dependent dropdown
- OTP verification (6-digit input, resend cooldown)
- Forgot password full flow: phone → OTP → reset password
- Home page (live profile data + recent requests, cards navigate to detail)
- Community page (live barangay info — schedule, accepted materials, contact)
- Capture page (DB-driven material selector, Cloudinary photo upload, pickup request submission)
- Requests list (Ongoing / History tabs, live data, skeleton loading, error/empty states)
- Request detail (photo banner, timeline, collection items breakdown)
- Profile page (live name + barangay, logout)
- Personal Information (edit mode, PATCH /resident/me, discard-changes modal)
- Notification Settings, Settings, Help & Support (UI shells — not yet wired to backend)

### Barangay side

- Dashboard (3 stat cards live, 3 hardcoded pending MRF/Program Funds modules)
- Collection Requests (full lifecycle: list, approve, decline, schedule, collect, detail)
- Redemption Management (programs list, program detail, transaction detail)

### Shared infrastructure

- `useFetch`, `useUpdate`, `useMutation` custom hooks
- `PageTransition` component — `motion/react` fade-in/out wrapper
- `haptics.js` — named haptic presets via `bzzz`
- `DesktopGuard` — blocks resident pages on non-mobile viewports (CSS `lg:hidden`)
- `SkeletonCard`, `Spinner`, `Error`, `Empty`, `Badge`, `SitioPill`, `Modal`, `LabelValue` UI components
- PWA manifest and splash screen

## Getting Started

Run the development server from this directory:

```bash
npm run dev
```

Open `http://localhost:3000` in the browser. The backend must also be running at `http://localhost:5001`.

The main app code is under `src/app`. Route groups:

- `(intro)` — Onboarding
- `(auth)` — Login, signup, OTP, forgot password, reset password, barangay login
- `(resident)` — Resident dashboard pages (mobile-only, guarded by `DesktopGuard`)
- `(barangay)` — Barangay admin pages

## References

- Root project instructions: `../AGENTS.md`
- Project docs: `../docs`
- Progress tracking: `../PROGRESS.md`
- Next.js docs: https://nextjs.org/docs
