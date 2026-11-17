# Compliance Matrix Tracker

Post-defense panel revisions. This file is the single place to see what is done and what is next, so a new chat can pick up from here without the old conversations.

Last updated: 2026-11-17

**Working style:** the maintainer writes the code. The AI assistant acts as a senior developer (review, risks, explanations, plans) and writes code only for repetitive work when the maintainer asks. Nothing is committed unless asked.

Legend: `[x]` done, `[~]` partly done, `[ ]` not started, `[?]` waiting on a decision or an outside party.

---

## 1. Status

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Uniform text inputs, asterisks on required fields | `[x]` | Light-touch version: consistent labels plus red asterisks based on each form's own validation. Not a shared input component. Needs a click-through in the browser. |
| 2 | Remove sitio (C2/CJK) from resident registration | `[x]` | Sitio is removed from signup. Staff assign it later in the Edit Resident modal. Sitio columns and filters hide when no resident has one. |
| 3 | Real-time form validation | `[ ]` | 11 `react-hook-form` forms have no `mode` set (submit-only validation). Modals built on plain `useState` have no validation machinery. See section 3. |
| 4 | OTP message masks the number | `[x]` | "An OTP has been sent to your number" with the number masked. Include in the push test. |
| 5 | Activate and ban resident accounts | `[~]` | `User.isActive` exists and login already blocks inactive accounts. Staff deactivation exists. Missing: resident deactivate/reactivate UI and the three-strikes photo mismatch tracking. |
| 6 | Parents as primary users, children as beneficiaries | `[~]` | Already works this way (resident is the beneficiary on redemption). No child/household record exists. May only need framing. Brainstorm. |
| 7 | SMS for cumulative points and announcements | `[?]` | Sender name is approved for OTP only. Email to the SMS provider is drafted (section 5). |
| 8 | Prices always 2 decimals, right-aligned; all floats 2 decimals | `[~]` | `formatCurrency` exists and is used in 11 files; 15 files format numbers on their own. Needs an audit and a plain-number helper. |
| 9 | Reward for the monthly leaderboard winner | `[ ]` | Brainstorm session first. Staff set a prize or title for first place each month. |
| 10 | Expand "MRF" to "Material Recycling Facility" | `[ ]` | Visible text only (sidebar, headings, reports, delete modal). Routes and DB names stay. |
| 11 | System-wide warning before critical actions | `[ ]` | Brainstorm session first. Example: negative program fund balance, so tell staff to sell stock before collecting more. |
| 12 | Per-user light and dark theme | `[ ]` | Largest item. Separate from the barangay accent theme. Many hard-coded colors. Decide where the choice is saved. |
| 13 | Improve the app logo | `[ ]` | Design work. Code side is swapping files (login pages, sidebar, favicon, app icon). |

---

## 2. What was done (session of 2026-11-15 to 2026-11-17)

Committed (five commits, nothing pushed):

- `0abe381` remove sitio from registration and polish the OTP screens
- `b7b8e5e` hide sitio fields when residents have no sitio
- `8e06058` add a middle name field to the Edit Resident modal
- `81e8de2` required-field asterisks on the remaining forms
- `9d40215` tighten the width of the admin and barangay login cards

**Uncommitted work from this session (30 files). Commit it after the push test.**

- **Middle name shown everywhere** as "First Middle Last": new `formatFullName` helpers (`frontend/src/lib/formatFullName.js`, `backend/src/utils/formatFullName.js`). Every backend query that builds a name now also selects `middleName`. About 11 frontend screens use the helper. The home greeting stays first-name-only. Name searches (`searchResident`, redemption, reward inventory) also match the middle name.
- **Resident profile page:** middle name field added (first, middle, last order). Asterisks appear only in edit mode. Middle name is required in the form, with the placeholder "Set your middle name". Save blocks blank required fields. Backend profile update returns and saves `middleName`, rejects blank first name, last name or phone number, and trims.
- **Edit Resident modal:** fixed the sitio comparison bug (it compared a name to an id, so "no changes" was never detected and Save with no changes showed "Edit failed"). Middle name is now required in the form. Values are trimmed. Backend `editResident` scopes the sitio lookup to the caller's barangay and rejects blank values.
- **Decline modal (pickup requests):** asterisk on the reason, blocks an empty reason, controlled textarea cleared on close, shows the server's error message, typo fixes.
- **`useUpdate` hook:** returns `false` on failure, resets `isLoading`, exposes `errorMessageRef` (same pattern as `useMutation`).

Rules decided:

- Middle name is required in the frontend forms (signup, resident profile, Edit Resident modal). The backend keeps it optional because older residents have no middle name.
- `useUpdate` stays for the pickup request lifecycle. `useMutation` is used everywhere else. They overlap but nothing is broken.
- `searchResident` uses `$queryRaw` on purpose (staff are included in the search).
- The status-transition guard on pickup requests (a request already COLLECTED could be rejected by a direct API call) is accepted risk for now.

Known leftovers:

- Old records keep first-and-last-name text in stored `performedBy` and `collectorName` columns.
- A `react-hooks/set-state-in-effect` lint error on the resident personal information page (it was there before this session).
- No build, browser click-through or end-to-end test has been run on the uncommitted work.

---

## 3. Plans per open item

**3. Real-time validation**
- For the 11 `react-hook-form` forms: add `mode: "onTouched"` (gentler) or `"onChange"`.
- For `useState` modals (Edit Resident, junkshop, expenses and others): small per-field checks, or move them to `react-hook-form`.
- Decision: every form, or only the ones where typos cost something (signup, login, staff, barangay)?

**5. Activate and ban accounts**
- Add a resident deactivate/reactivate button on the residents page with a confirm modal and a reason. Endpoint scoped to `req.user.barangayId`.
- Three strikes: nothing records "photo did not match" today. Add one field on the request (for example a collector flag at the COLLECTED step) and count per resident. This needs a migration, tested on a local database first.
- Decisions: automatic ban at three strikes or warn staff and let them decide? Do strikes expire? Does a banned resident see why when logging in?

**6. Parents and children**
- Decide between (a) framing only, such as "household account" wording in the UI and docs, or (b) an optional "released to" name on a reward release.

**7. SMS**
- Blocked on the provider. Also decide the triggers (points milestone, new announcement) and whether residents can opt out.

**8. Decimal formatting**
- Find the 15 files that bypass `formatCurrency` (search for `toFixed`, `toLocaleString`, `₱`). Add a plain-number helper (kg and other floats, 2 decimals). Right-align money and number columns in tables.

**9. Leaderboard reward**
- Brainstorm: who sets the prize, title or prize or both, per month, who gets notified.

**10. MRF rename**
- Visible text only. Check how the long name fits in the sidebar.

**11. Warnings**
- Brainstorm: which actions are critical, exact triggers (negative fund balance, large unsold stock), warn or block, where the message shows.

**12. Dark mode**
- Move hard-coded colors to variables first, then add the dark values. Decide: save on the account (needs a new column and migration) or on the device only.

**13. Logo**
- Decide on the design. Then swap it in the login pages, sidebar, favicon and app icon.

---

## 4. Schedule (tentative, adjust freely)

**Today, Tue 2026-11-17**
- [x] Save this tracker.
- [ ] Send the SMS provider email (draft in section 5).
- Session closed.

**Wed 2026-11-18**
- [ ] Commit the current batch, then push-test it on `ecoaid_demo` (check `DATABASE_URL` first; never Neon; use the blank-SMS-key guard when testing signup). Test list: middle name on every screen, Edit Resident (no change, sitio only, no middle name, no sitio), resident profile edit, decline modal, approve and schedule, name search, OTP screen.
- [ ] Item 8: decimal formatting audit and fix.

**Thu 2026-11-19**
- [ ] Item 10: MRF rename.
- [ ] Item 3: real-time validation on the `react-hook-form` forms.

**Fri 2026-11-20**
- [ ] Item 5: resident deactivate/reactivate (no strikes yet).
- [ ] Decide the strike rules (see section 3).

**Next week**
- [ ] Brainstorm sessions: warnings (11), leaderboard reward (9), parents and children (6).
- [ ] Item 5 strikes and migration, once the rules are decided.
- [ ] Item 3: the `useState` modals.
- [ ] Item 13: logo decision.
- [ ] Item 12: dark mode (last of the code items).
- [ ] Item 7: SMS, depending on the provider's reply.

---

## 5. SMS provider email (draft)

**To:** Semaphore support
**Subject:** Using our approved sender name for non-OTP notifications (EcoAid)

Hello Semaphore team,

We use Semaphore for one-time passwords in EcoAid, a waste management and recycling system for barangays in the Philippines. Our sender name is currently approved and working for OTP messages through the OTP endpoint.

We would like to start sending informational messages to our residents, for example:
1. A short update on their recycling points balance.
2. A notice when their barangay posts an announcement.

Could you please advise on the following:
1. Can our existing approved sender name be used for these messages through the regular messages endpoint, or do we need to register a separate sender name? If so, what are the requirements and how long does approval usually take?
2. Are there content rules or template approvals for informational or notification messages?
3. How are these messages priced compared with OTP messages, and how are credits counted for messages longer than one SMS?
4. Do you require opt-out or consent handling for messages like these?
5. Are there rate limits or sending-time restrictions we should plan for? We expect a few hundred recipients per barangay during our pilot.

Thank you for your help.

Best regards,
[Your name]
[Account email registered with Semaphore]
[Current sender name]
