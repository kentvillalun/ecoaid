# Business Rules

## 1. Immediate Sorting

All materials are sorted immediately during collection or intake. No delayed sorting.

---

## 2. Contribution / Intake as the Core Entity

All recyclable material intake is recorded as a **Contribution / Intake Transaction**, through one of two channels:

- **Pickup request** (resident asks for a pickup; recorded when the request is COLLECTED, ledger source `COLLECTION_REQUEST`)
- **Manual intake** (staff record Sunday EcoAid, events, barangay hall exchange or any direct submission, ledger source `MANUAL_INTAKE`)

The real-world occasions (Sunday EcoAid, event collection, barangay exchange) are not stored as separate fields; they are all manual intake.

---

## 3. Collection Requests Scope

Collection Requests handles pickup workflow only (override / on-demand). Sunday EcoAid, events, and barangay exchange do NOT create requests. Collection requests are optional per barangay (`hasCollectionRequests`); not every barangay practices them.

---

## 4. Pickup Request Lifecycle

REQUESTED → APPROVED → IN_PROGRESS → COLLECTED, or REQUESTED → REJECTED.

A resident can CANCEL a request only while it is REQUESTED. A REQUESTED request older than 2 days is EXPIRED automatically (checked whenever the list is fetched; there is no scheduled job).

COLLECTED means materials are already picked up, sorted, and recorded as intake.

---

## 5. ASSORTED Material Type

A pickup request may be marked assorted. During collection, the collector finalizes the actual breakdown by material.

---

## 6. Sunday EcoAid and Other Direct Intake

Entries with no prior request are recorded in the Manual Collection Intake module by searching the person and entering their contribution. The search finds residents **and barangay staff** (staff bring recyclables as their attendance, and that must be recorded against their own account). If the person has no account, a free-text household name can be entered instead.

---

## 7. Leaderboard Inclusivity

All contributions linked to an account count toward the leaderboard: pickup collections, manual intake and redemption transactions, for residents and for staff. Effort is recognized regardless of app usage, with one limit: an entry recorded under a free-text household name (no account) cannot be ranked.

---

## 8. Pickup Requests Are Not Rewarded

Pickup request contributions are community participation obligations. There is no reward equivalent for completing a pickup request.

---

## 9. Redemption Program Structure

Redemption is a separate incentive program run by the barangay (for example the SK's school-supplies program, or a monthly rice program). It is independent from the community-engagement flow: contributions through collection requests and manual intake are recorded in kg/pieces and ranked on the leaderboard, while redemption transactions earn points (or cash) inside one program.

- Staff (CAPTAIN, SECRETARY, SK, TREASURER) create programs with a name, description, allotted budget, and a mode: **points** or **cash**.
- Per-material values (`pointValue` or `cashValue`) are stored per program, so values are never overwritten across programs. There is no maximum-points cap.
- A program can be deactivated; an inactive program accepts no new transactions.
- The mode cannot be changed once the program has transactions (records are valued in the old mode); create a new program instead.
- A material that already appears in a transaction cannot be removed from the program.
- Every material in a program must belong to the barangay creating it.
- When a program is created, it can announce itself to residents automatically (roles that can post announcements: CAPTAIN, SECRETARY, SK). The announcement is a snapshot and is not updated if the program is edited later.

---

## 10. Frozen Redemption Transactions

Each redemption line item stores the value in force at the time (`currentValue`). Past transactions are unaffected by future point value changes. Each transaction also keeps the collector's name and the resident's name as written at the time.

---

## 11. Redemption Beneficiary and Points

- The beneficiary of a redemption transaction is a **registered resident** (`residentId`); there is no separate beneficiary record. A resident without an account cannot take part.
- Recording a redemption transaction marks the resident as verified, like a completed pickup or manual intake, so they can see programs and points in the resident app.
- Points belong to one resident **in one program**. Nothing stores the number: the balance is computed as *points earned in that program* minus *points spent on rewards in that program*, so it can never disagree with the records.
- Points earned in one program cannot be spent on another program's rewards.

---

## 12. Reward Releasing

Releasing of rewards happens in the Reward Inventory module, not in Redemption Programs. A release is allowed only when:

- every reward item belongs to the chosen program and barangay,
- enough stock remains (stock is the added quantity minus prior releases), and
- the resident's balance in that program covers the total point cost.

The same item listed twice in one release is treated as one line.

---

## 13. MRF Inventory

MRF Inventory is derived from the stock ledger (`StockTransactionLog`); staff do not type balances in. Intake, pickup collections and redemption transactions add stock; junkshop sales and manual stock-out adjustments remove it. The only manual action is a stock-out adjustment (for example materials used for beautification), validated against the current balance.

---

## 14. Program Funds

Program Funds tracks expenses, income/proceeds, and profits. Plant distribution expenses are recorded here. No resident linking is required for plant distribution.

---

## 15. Junkshop Sales

The barangay sells recyclables to junkshops. Receipts from these sales are recorded as income in Program Funds.

---

## 16. Junkshop Price Comparison

The Junkshop Sales module tracks price offers per material type from multiple junkshops. This allows the barangay to compare buyers and sell to whoever offers the highest price.

---

## 17. Core Materials

Every barangay is created with the same core material list (`backend/src/utils/coreMaterials.js`), and the AI photo classification only recognizes materials in that list. Staff (CAPTAIN, SECRETARY) can add more materials in Settings; those work for intake, programs and sales, but the AI will not detect them. Materials cannot be removed or deactivated by a barangay; an unused material is simply ignored.

---

## 18. Barangay Isolation

Every barangay sees only its own data. Any lookup or change must be scoped to the caller's own `barangayId`; an id alone is never enough.

---

## 19. Roles and Modules

Staff roles are CAPTAIN, SECRETARY, TREASURER, SK and COLLECTOR. Which routes each role may open is defined once in `frontend/src/lib/roles.js` (`ROLE_MATRIX`) and mirrored by `requireRoles(...)` on each backend route. Separately, a barangay can switch whole modules on or off (`hasCollectionRequests`, `hasRedemptionManagement`, `hasRewardInventory`, `hasLeaderboard`).
