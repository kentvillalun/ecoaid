export const convertToKg = (amount, unit) => {
  if (unit === "GRAMS") {
    return amount / 1000;
  } else if (unit === "LBS") {
    return amount / 2.2046226218;
  } else {
    return amount;
  }
};
