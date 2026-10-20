# Module Boundaries

## Collection Requests
Handles override / on-demand pickup requests only. Responsible for the pickup workflow: REQUESTED, APPROVED, IN_PROGRESS, COLLECTED, REJECTED, plus the resident-driven CANCELLED and the automatic EXPIRED. Supports assorted requests — finalized by the collector at completion. Optional per barangay (`hasCollectionRequests`). The resident capture flow includes AI photo classification, limited to the core material list.

---

## Manual Collection Intake
Records actual recyclable materials from all direct sources: Sunday EcoAid, event-based collection, barangay exchange, and any intake without a prior request. All materials are sorted immediately and recorded as intake transactions. The contributor is searched by name among residents **and staff** (staff attendance contributions); with no account, a free-text household name is used. Each submission writes `IN` rows to the stock ledger.

---

## MRF Inventory
Per-material balance derived from the stock ledger. No balances are typed in. Intake, pickup collections and redemption transactions add stock; junkshop sales and manual stock-out adjustments remove it. The only manual action is a stock-out adjustment.

---

## Redemption Management
Staff (CAPTAIN, SECRETARY, SK, TREASURER) create and manage programs (e.g. basura to school supplies, a monthly rice program). Each program has a name, allocated budget, description, and an `isCashMode` flag (cash vs. points). Per-material reward values (`pointValue` / `cashValue`) live in `ProgramMaterial`. A transaction records the **resident** (the beneficiary, a registered user), the collector's name and the resident's name as they were at the time; its line items live in `RedemptionTransactionItem` with a frozen `currentValue`. Programs are scoped per barangay.

Boundaries:
- Redemption is independent from collection requests and manual intake. It does not create intake records, but it does add the materials to the stock ledger and counts toward the leaderboard.
- It owns the **points balance** (computed per resident per program in `utils/residentPoints.js`). Releasing rewards belongs to Reward Inventory.
- A program can auto-create an announcement when it is created (the Announcements module owns the record afterwards).
- The mode of a program with transactions is locked.

---

## Reward Inventory
Tracks goods, medicine, supplies, and service outputs per program (`RewardItem`, with a point cost). Releasing of rewards happens here (`RewardRelease`, linked to the resident), checked against stock and the resident's balance in that program. Plant inventory is managed here with expenses logged in Program Funds.

---

## Resident Programs Page
Read-only resident view of the barangay's active programs: accepted materials with their values and available rewards. Shown only when the barangay has `hasRedemptionManagement`, and only to verified residents. Showing the resident's own points here is the next step.

---

## Program Funds
Tracks all financial records for the barangay's recycling program: income from junkshop sales, expenses (including redemption programs and plant distribution), and the overall net. Serves as the central financial overview module. Junkshop receipts are recorded here as income.

---

## Leaderboard
Ranks contributors by total recyclable contribution, by kilogram and by piece, with a period filter. Counts every ledger entry linked to an account (pickup collections, manual intake, redemption), for residents and for staff. Entries recorded under a free-text household name cannot be ranked. Serves as recognition for the barangay and motivation for residents. Resident view: Standings.

---

## Junkshop Sales
Tracks price offers per material type from multiple junkshops. The barangay uses this module to compare buyers and identify who offers the highest price per material, enabling smarter selling decisions to maximize profit. Receipts from completed sales are recorded as income in Program Funds and remove the materials from the stock ledger.

---

## Announcements and Notifications
Staff (CAPTAIN, SECRETARY, SK) post announcements by category; residents read them once verified. Notifications are created only as a side effect of pickup-request status changes; there is no endpoint for a client to create one.

---

## Residents (staff side)
CAPTAIN and SECRETARY list residents, edit their details and verify them.

---

## Reports
Four independent sections (MRF Inventory, Collection & Intake, Redemption & Rewards, Program Funds), each with its own date range, and one Excel export that bundles them. The preview and the export share the same queries in `utils/reportHelpers.js`.

---

## Settings
CAPTAIN and SECRETARY choose the barangay's color theme and add materials. The AI classification does not learn materials added here.

---

## Super Admin
A separate platform portal (own login, cookie and middleware). Registers barangays (address, contact, theme, module flags), manages their staff accounts and sitios, and shows which barangays still miss a required role or sitios. It is not part of the barangay `ROLE_MATRIX`.
