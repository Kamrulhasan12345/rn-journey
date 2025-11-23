import { ColorSchemeName } from "react-native";

export type Theme = {
  colors: {
    background: string;
    surface: string;
    card: string;
    text: string;
    subtext: string;
    border: string;
    primary: string;
    chipBg: string;
    elevated: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    pill: number;
  };
  shadow: {
    elevation: number;
    shadowColor: string;
    shadowOpacity: number;
    shadowRadius: number;
    shadowOffset: { width: number; height: number };
  };
};

export function getTheme(colorScheme: ColorSchemeName): Theme {
  const isDark = colorScheme === "dark";

  return {
    colors: {
      background: isDark ? "#0B0B0C" : "#F6F7F9",
      surface: isDark ? "#141518" : "#FFFFFF",
      card: isDark ? "#16181B" : "#FFFFFF",
      text: isDark ? "#F3F4F6" : "#0F172A",
      subtext: isDark ? "#A1A1AA" : "#64748B",
      border: isDark ? "#2A2B31" : "#E5E7EB",
      primary: "#007AFF",
      chipBg: isDark ? "#23252A" : "#F1F5F9",
      elevated: isDark ? "#1E1F23" : "#FFFFFF",
    },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
    radius: { sm: 6, md: 10, lg: 14, pill: 999 },
    shadow: {
      elevation: isDark ? 1 : 3,
      shadowColor: isDark ? "#000000" : "#000000",
      shadowOpacity: isDark ? 0.2 : 0.1,
      shadowRadius: isDark ? 4 : 6,
      shadowOffset: { width: 0, height: 2 },
    },
  };
}
