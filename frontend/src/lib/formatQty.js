// Pieces are whole numbers, every other unit (kg, grams, lbs) shows 2 decimals.
// `unit` can be the stored value ("PIECE", "KG") or a label ("pcs", "kg").
export const formatQty = (value, unit) => {
  const amount = Number(value ?? 0);
  const isPiece = /^(piece|pieces|pcs|pc)$/i.test(unit ?? "");

  return amount.toLocaleString("en-PH", {
    minimumFractionDigits: isPiece ? 0 : 2,
    maximumFractionDigits: isPiece ? 0 : 2,
  });
};
