export const THEMES = {
  FOREST_GREEN: {
    name: "Forest Green",
    accent: "#14532D",
    accentHover: "#1f7a42",
    accentLight: "#EAF7E3",
    accentDark: "#092517",
  },
  OCEAN_TEAL: {
    name: "Ocean Teal",
    accent: "#115E59",
    accentHover: "#0D9488",
    accentLight: "#CCFBF1",
    accentDark: "#0A3D3A",
  },
  SUNRISE_ORANGE: {
    name: "Sunrise Orange",
    accent: "#9A3412",
    accentHover: "#EA580C",
    accentLight: "#FFEDD5",
    accentDark: "#6B240C",
  },
  ROYAL_PURPLE: {
    name: "Royal Purple",
    accent: "#6B21A8",
    accentHover: "#9333EA",
    accentLight: "#F3E8FF",
    accentDark: "#4A1573"
  },
  DEEP_MAROON: {
    name: "Deep Maroon",
    accent: "#7F1D1D",
    accentHover: "#B91C1C",
    accentLight: "#FEE2E2",
    accentDark: "#5C1414"
  },
    EARTH_BROWN: {
    name: "Earth Brown",
    accent: "#78350F",
    accentHover: "#B45309",
    accentLight: "#FEF3E2",
    accentDark: "#4A2107",
  },
  SUNFLOWER_GOLD: {
    name: "Sunflower Gold",
    accent: "#A16207",
    accentHover: "#EAB308",
    accentLight: "#FEF9C3",
    accentDark: "#713F12",
  },
};

export const applyTheme = (themeKey) => {
  const theme = THEMES[themeKey];

  if (!theme) return;

  document.documentElement.style.setProperty("--color-accent", theme.accent)
  document.documentElement.style.setProperty("--color-accent-hover", theme.accentHover)
  document.documentElement.style.setProperty("--color-accent-light", theme.accentLight)
  document.documentElement.style.setProperty("--color-accent-dark", theme.accentDark)
}