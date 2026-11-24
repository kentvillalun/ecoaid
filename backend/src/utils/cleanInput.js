export const cleanText = (text) =>
  String(text ?? "")
    .trim()
    .split(" ")
    .filter(Boolean)
    .join(" ");

export const cleanName = (name) =>
  cleanText(name)
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const NO_MIDDLE_NAME = ["na", "none", "n/a"]

export const cleanMiddleName = (name) => {
    const cleaned = cleanName(name)

    return NO_MIDDLE_NAME.includes(cleaned.toLowerCase()) ? "NA" : cleaned
}