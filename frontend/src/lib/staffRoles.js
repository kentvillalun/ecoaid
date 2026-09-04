// Fixed display order for staff roles across the admin barangay-accounts
// section — the API doesn't guarantee any particular order, so the UI
// always renders these 5 roles in this exact order regardless of what
// comes back in the accounts list.
export const STAFF_ROLES = [
  { value: "CAPTAIN", label: "Captain" },
  { value: "TREASURER", label: "Treasurer" },
  { value: "SECRETARY", label: "Secretary" },
  { value: "COLLECTOR", label: "Collector" },
  { value: "SK", label: "SK" },
];
