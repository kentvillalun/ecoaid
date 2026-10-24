// "15 pts/kg", "₱2/pc" for a program material's value per unit
export const formatMaterialRate = (programMaterial, isCashMode) => {
  const value = isCashMode
    ? (programMaterial.cashValue ?? 0)
    : (programMaterial.pointValue ?? 0);

  const defaultUnit = programMaterial.material?.defaultUnit;
  const unit = defaultUnit === "PIECE" ? "pc" : defaultUnit?.toLowerCase();

  return isCashMode ? `₱${value}/${unit}` : `${value} pts/${unit}`;
};
