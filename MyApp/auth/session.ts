import { clearSessionStorage, readSessionFromStorage, writeSessionToStorage } from "./token-storage";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type SessionState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
};

let inMemoryAccessToken: string | null = null;
let cachedSession: SessionState | null = null;

export const readSession = async (): Promise<SessionState> => {
  const session = await readSessionFromStorage();
  cachedSession = session;
  // Ensure in-memory token is hydrated for early interceptors
  inMemoryAccessToken = session.accessToken;
  return session;
};

export const hydrateAccessTokenFromStorage = async (): Promise<void> => {
  const session = await readSession();
  inMemoryAccessToken = session.accessToken;
};

export const getSession = (): SessionState => {
  return (
    cachedSession ?? {
      user: null,
      accessToken: null,
      refreshToken: null,
    }
  );
};

export const setSession = async (state: SessionState): Promise<void> => {
  await writeSessionToStorage(state);
  cachedSession = state;
  inMemoryAccessToken = state.accessToken;
};

export const clearSession = async (): Promise<void> => {
  await clearSessionStorage();
  cachedSession = {
    user: null,
    accessToken: null,
    refreshToken: null,
  };
  inMemoryAccessToken = null;
};

export const getAccessTokenFromMemory = (): string | null => inMemoryAccessToken;

export const setAccessTokenInMemory = (token: string | null): void => {
  inMemoryAccessToken = token;
};
