# Defense Demo Script

Sidebar order = demo order, so the panel can follow along visually. Each step names the FR (from `fr-process-documentation.md`) it proves. One barangay account (Captain) opens every page.

## Setup (before the panel)

- Confirm `backend/.env` points at `ecoaid_demo`. Never Neon.
- Everything is pre-logged-in. Switching = clicking a tab, no login/logout on stage.
  - Tab 1: Captain, populated Beddeng Laud (pages pre-warmed).
  - Tab 2: verified Resident, phone-sized window (a different cookie name, so the same profile works).
  - Temporary incognito windows: Act 1 (Super Admin) and Act 3 step 1 (new resident signup). Incognito avoids the FR1 stale-session bug.
- Warm the backend first (a cold start is an awkward delay). Keep the backend terminal visible for OTP codes.
- New-barangay zip code and contact number must be unused by any rehearsal (duplicates are rejected).
- Pre-seed one clean "ready to approve" pickup request and a resident with enough points.

**Say first (10 sec):** "Everything in this system starts with a resident's recyclables. We'll set up a barangay, run the barangay's side, then end with the resident."

**Time budget:** Act 1 about 3 min. Act 2 about 50% of total time (hard stop, skip Settings details if behind). Act 3 about 25-30%. Never cut Act 3.

## Act 1: The system is generic (temp incognito, empty barangay)

1. Super Admin: register a barangay, module flags, sitios, staff accounts (FR3, FR4).
2. Log in as the new Captain (FR2), show the empty dashboard and role-limited sidebar. Close the temp tab.

## Act 2: How it runs (Captain tab, populated data, in sidebar order)

1. **Dashboard**: overview of what follows.
2. **Residents**: who belongs to the barangay, verification (FR27).
3. **Collection Requests**: pre-seeded pending request → approve → batch schedule → finalize with an assorted breakdown (FR9).
4. **Manual Intake**: Sunday door-to-door, resident search + household fallback (FR10).
5. **Redemption**: create a program (Announce toggle), record a transaction, per-program resident balance (FR13-15).
6. **Rewards**: add item, release against points (FR16, FR17).
7. **Junkshop Sales**: compare prices, record a sale (FR19, FR21).
8. **MRF Inventory**: the payoff. The ledger shows INs from collection, manual intake and redemption, and the OUT from the sale. Then a manual stock-out (FR11, FR12).
9. **Program Funds**: expense; income derived from sales (FR18, FR22).
10. **Announcements**: post one (FR23).
11. **Leaderboard**: staff view (FR26).
12. **Reports**: preview + Excel export (FR28).
13. **Settings** (bottom of sidebar): theme, materials, junkshop partners (FR29, FR30, FR20).

## Act 3: The resident side, full flow (finale)

1. Brand-new resident signs up into Beddeng Laud (incognito), OTP from the backend console, log in (FR1, FR2). Unverified, so no Programs yet. That sets up the payoff.
2. Capture with image recognition: photo → suggested material → confirm/correct, estimate, submit (FR7, FR5). The FR doc lists FR7 as not implemented, but commit 1f46f90 added a classifier. Verify it in the running app first; if it fails, say honestly that it is photo evidence only.
3. Flip to the Captain tab: the request appears under Pending, approve it (closes the loop with FR9).
4. Flip back: notification (FR25), request status and history (FR8). Cancel a second request (FR6).
5. Switch to the verified resident tab: announcements the Captain just posted (FR24), Programs (FR31), points balance, leaderboard (FR26). End on the leaderboard.

Role restriction (FR4 / FR9 gates): explain via `ROLE_MATRIX`, or show a 20-second pre-logged-in Collector/Treasurer window if time allows.

## If it breaks

- Backend slow or down: restart it, narrate over the architecture (frontend → Express → Prisma → Postgres) while it boots.
- OTP not arriving: read it from the backend console (dev logs OTP there).
- Classifier fails: continue with manual material selection, state FR7 honestly.
- A page errors: skip to the next sidebar item; the order is independent per module except MRF (needs Act 2 steps 3-7 done first).

## Known issues to avoid on stage

- "Invalid Date" in the timeline of cancelled/expired requests.
- "Stat TBD / Placeholder" card on Junkshop Sales.
- "Someting went wrong" toast when declining a request with an empty reason.
- FR3, 4, 10, 13-17, 26, 28, 30, 31 were revised from code and not verified live. Rehearse these first, along with redemption edit/delete.
