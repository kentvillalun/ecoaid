# Module Boundaries

## Collection Requests
Handles override / on-demand pickup requests only. Responsible for the pickup workflow: REQUESTED, APPROVED, IN_PROGRESS, COLLECTED, REJECTED. Supports ASSORTED material type — finalized by collector at completion.

---

## Manual Collection Intake
Records actual recyclable materials from all sources: Sunday EcoAid, pickup requests being completed, event-based collection, and barangay exchange. All materials are sorted immediately and recorded as intake transactions. Sunday EcoAid entries with no prior request are manually entered here by searching the resident. Entries are flagged with source type and hasAppRecord status.

---

## Material Stock
Read-only view of recyclable materials derived from completed intake transactions. No manual input here.

---

## Redemption Management
SK creates and manages programs (e.g. basura to school supplies). Each program has a name, allocated budget, description, and an `isCashMode` flag for cash-equivalent vs. points reward mode. Per-material reward values (`pointValue` / `cashValue`) are stored in the `ProgramMaterial` junction table. Redemption transactions record beneficiary, collector, and educational level; line items are stored in `RedemptionTransactionItem` with a frozen `currentValue` snapshot per material. Programs are scoped per barangay.

---

## Reward Inventory
Tracks goods, medicine, supplies, and service outputs available for release. Releasing of rewards happens here. Plant inventory is managed here with expenses logged in Program Funds.

---

## Program Funds
Tracks all financial records: expenses, junkshop sale proceeds, profits, and fund summaries. Junkshop receipts are inputted here as income.

---

## Leaderboard
Ranks residents by total recyclable contribution. Includes both app-based and manual entries. Serves as recognition for the barangay and motivation for residents.

---

## Junkshop Sales
Tracks price offers per material type from multiple junkshops. The barangay uses this module to compare buyers and identify who offers the highest price per material, enabling smarter selling decisions to maximize profit. Receipts from completed sales are recorded as income in Program Funds.

--- 

## Program Funds
Tracks all financial records for the barangay's recycling program. This includes income from junkshop sales, expenses from redemption programs and plant distribution, and overall profit summaries. Serves as the central financial overview module.