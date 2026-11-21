export const formatCurrency = (amount) => {
    return `₱${Number(amount ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}