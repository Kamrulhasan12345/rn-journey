import { Platform } from "react-native";
import * as Keychain from "react-native-keychain";
import { storage } from "../storage";
import type { SessionState, AuthUser } from "./session";

const ACCESS_TOKEN_KEY = "auth:accessToken";
const USER_KEY = "auth:user";
const REFRESH_TOKEN_SERVICE = "auth:refreshToken";

const hasNativeKeychain =
  (Platform.OS === "ios" || Platform.OS === "android");

const parseUser = (raw: string | undefined | null): AuthUser | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const readSessionFromStorage = async (): Promise<SessionState> => {
  const accessToken = storage.getString(ACCESS_TOKEN_KEY) ?? null;
  const userJson = storage.getString(USER_KEY);
  const user = parseUser(userJson ?? null);

  let refreshToken: string | null = null;

  if (hasNativeKeychain) {
    const creds = await Keychain.getGenericPassword({ service: REFRESH_TOKEN_SERVICE });
    refreshToken = creds ? creds.password : null;
  } else {
    refreshToken = storage.getString("auth:refreshToken") ?? null;
  }

  return { user, accessToken, refreshToken };
};

export const writeSessionToStorage = async (state: SessionState): Promise<void> => {
  if (state.accessToken) {
    storage.set(ACCESS_TOKEN_KEY, state.accessToken);
  } else {
    storage.remove(ACCESS_TOKEN_KEY);
  }

  if (state.user) {
    storage.set(USER_KEY, JSON.stringify(state.user));
  } else {
    storage.remove(USER_KEY);
  }

  if (hasNativeKeychain) {
    if (state.refreshToken) {
      await Keychain.setGenericPassword("refresh", state.refreshToken, {
        service: REFRESH_TOKEN_SERVICE,
        accessible: Keychain.ACCESSIBLE.ALWAYS,
      });
    } else {
      await Keychain.resetGenericPassword({ service: REFRESH_TOKEN_SERVICE });
    }
  } else {
    if (state.refreshToken) {
      storage.set("auth:refreshToken", state.refreshToken);
    } else {
      storage.remove("auth:refreshToken");
    }
  }
};

export const clearSessionStorage = async (): Promise<void> => {
  storage.remove(ACCESS_TOKEN_KEY);
  storage.remove(USER_KEY);
  const hasNativeKeychain = Platform.OS === "ios" || Platform.OS === "android";
  if (hasNativeKeychain) {
    await Keychain.resetGenericPassword({ service: REFRESH_TOKEN_SERVICE });
  } else {
    storage.remove("auth:refreshToken");
  }
};
