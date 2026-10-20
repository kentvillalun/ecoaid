# ECOPROFIT Frontend

This frontend is the resident, barangay staff and Super Admin web interface for the ECOPROFIT (EcoAid) system.

## Current Status

The frontend is feature-complete for all currently implemented modules. All three sides are connected to the backend end-to-end.

### Resident side (mobile only)

- Onboarding flow (illustrations, slide animation, haptic feedback)
- Login with bottom-sheet card design and splash screen, signup with barangay autocomplete and sitio dropdown, OTP, forgot/reset password
- Home (profile, recent requests, standings shortcut), Community / Barangay tab (barangay info, accepted materials, latest announcements, redemption programs preview, contact)
- Capture (photo, client-side compression, "Analyze Photo" AI suggestion with manual fallback, Cloudinary upload, leave-page guard)
- Requests list (Ongoing / History), request detail (photo, timeline, collection breakdown, cancel)
- Programs (`/programs`): active redemption programs with accepted materials and available rewards (shown when the barangay enables redemption; locked until the resident is verified)
- Standings (leaderboard by kg / by piece, period filter), Updates (announcements), Notifications
- Profile, personal information (edit mode), settings, terms, help and support

### Barangay side (role-scoped)

- Dashboard, Collection Requests (full lifecycle, batch collection), Manual Intake (search residents and staff, household-name fallback, material rows)
- MRF Inventory (balances, ledger log, stock-out), Redemption (programs, program and transaction detail, record transaction for a registered resident), Reward Inventory (items and release history with program filters, release reward)
- Junkshop Sales, Program Funds, Announcements, Leaderboard, Residents, Reports (four sections, Excel export), Settings (theme, add material)

### Super Admin side

- Admin dashboard (barangays that still need setup), barangay accounts (list, register, detail, edit, staff, sitios)

### Shared infrastructure

- `proxy.js` — edge middleware: verifies the login cookies with `jose`, redirects unauthenticated users, and sends a staff role to `/403` when `ROLE_MATRIX` does not allow the route
- `lib/roles.js` — `ROLE_MATRIX` (route → allowed staff roles); a new barangay route needs an entry here
- `lib/getBarangayModules.js` — hides modules a barangay has switched off
- Hooks: `useFetch` (GET; does nothing while `url` is empty, so a dependent fetch can be paused), `useMutation` (returns `true` on success; `errorMessageRef` holds the server's message for 4xx errors), `useUpdate`
- UI: `Modal`, `DropdownFilter`, `StatusChip`, `DateRangePicker`, `HoverPortal` (hover breakdown popovers), `Badge`, `MaterialTag`, `SkeletonCard`, `Spinner`, `Error`, `Empty`, `DesktopGuard`, `PageTransition`
- `error.jsx` and `global-error.jsx` error boundaries; `haptics.js`; PWA manifests and splash screen

## Getting Started

Create `.env.local` (see the root `README.md` for the variables), then run the development server from this directory:

```bash
npm run dev
```

Open `http://localhost:3000` in the browser. The backend must also be running at `http://localhost:5001`; the app rewrites `/api/*` to it.

The main app code is under `src/app`. Route groups:

- `(intro)` — Onboarding
- `(auth)` — Login, signup, OTP, forgot password, reset password, barangay login, admin login
- `(resident)` — Resident pages (mobile-only, guarded by `DesktopGuard`)
- `(barangay)` — Barangay staff pages
- `(admin)` — Super Admin portal

## References

- Root project instructions: `../AGENTS.md`, `../CLAUDE.md`
- Project docs: `../docs`
- Progress tracking: `../PROGRESS.md`
- Next.js docs: https://nextjs.org/docs
