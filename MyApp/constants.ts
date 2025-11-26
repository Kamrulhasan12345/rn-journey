import { Platform } from "react-native";

// API base URL (custom domain, no localhost). Override per env/build as needed.
export const API_BASE_URL = "https://notenen.onrender.com/";

// x-client-platform is required by backend to decide where refreshToken lives.
// For React Native Web, Platform.OS will be 'web'.
export const getClientPlatformHeader = (): "mobile" | "web" => {
  return Platform.OS === "web" ? "web" : "mobile";
};

// Lightweight device info, only OS and version.
export const getDeviceInfoHeader = (): string => {
  const version = typeof Platform.Version === "string" || typeof Platform.Version === "number"
    ? String(Platform.Version)
    : "unknown";

  return `os=${Platform.OS};version=${version}`;
};

// Placeholder export to avoid breaking existing imports that used demo items.
// You can remove this once everything is wired to real data.
export const items: never[] = [];
