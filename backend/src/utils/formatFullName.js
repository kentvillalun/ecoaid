// "First Middle Last"; a missing middle name is skipped
export const formatFullName = (user) =>
  [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ");
