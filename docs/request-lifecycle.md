# Request Lifecycle

## Scope
Applies only to override / on-demand pickup requests. Does NOT apply to Sunday EcoAid, events, or barangay exchange. Optional per barangay (`hasCollectionRequests`).

---

## Status Flow
REQUESTED → APPROVED → IN_PROGRESS → COLLECTED
REQUESTED → REJECTED
REQUESTED → CANCELLED (by the resident)
REQUESTED → EXPIRED (automatic)

---

## Definitions

### REQUESTED
Resident submits a pickup request with a photo. The request can be marked assorted if recyclables are mixed. The resident can use "Analyze Photo" to have the material and quantity suggested; the barangay always verifies the real value at collection.

---

### APPROVED
Barangay accepts the request and marks it ready for pickup.

---

### IN_PROGRESS
Request selected for batch collection or part of ongoing pickup activity.

---

### COLLECTED
Materials have been picked up, sorted, and recorded as an intake transaction. If the request was assorted, the collector finalizes the actual breakdown by material at this step. Stock is written to the ledger (`COLLECTION_REQUEST`).

---

### REJECTED
Request is declined with a rejection reason.

---

### CANCELLED
The resident withdrew the request. Only allowed while the request is still REQUESTED.

---

### EXPIRED
A REQUESTED request that nobody acted on for more than 2 days. There is no scheduled job: requests are expired whenever the request list is fetched, and the resident is notified.

---

## Notifications
Residents are notified when their request becomes APPROVED, IN_PROGRESS, COLLECTED, REJECTED or EXPIRED. Notifications are only created as a side effect of these status changes.

---

## Batch Collection
Moves one or more APPROVED requests into IN_PROGRESS simultaneously.

---

## Sunday EcoAid Gap
If a resident contributes during Sunday EcoAid without having made a prior request, the collector manually inputs the record in the Manual Collection Intake module by searching the resident. No request is created for this flow.
