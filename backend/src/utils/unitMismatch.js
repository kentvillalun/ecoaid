const VALID_UNITS = ["KG", "GRAMS", "LBS", "PIECE"];

// A material's default unit decides whether it is counted in pieces or by
// weight. Weight units can be mixed (they all convert to kg), but a piece
// material can't be recorded in kg or the other way round, otherwise its stock
// splits into two balances. Returns an error message, or null when all is fine.
export const findUnitMismatch = (items, materials, unitKey) => {
  const byId = new Map(materials.map((m) => [m.id, m]));

  for (const item of items) {
    const unit = item[unitKey];
    const material = byId.get(item.materialId);

    if (!material || !VALID_UNITS.includes(unit)) return "Invalid unit";

    if ((unit === "PIECE") !== (material.defaultUnit === "PIECE")) {
      return material.defaultUnit === "PIECE"
        ? `${material.name} is counted in pieces`
        : `${material.name} is counted by weight (kg, grams or lbs), not pieces`;
    }
  }

  return null;
};
