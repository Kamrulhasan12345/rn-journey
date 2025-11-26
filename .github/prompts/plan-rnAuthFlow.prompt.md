## Plan: RN Auth Flow (Axios + TanStack Query)

Implement login and refresh with Axios and TanStack Query, using your custom base URL. Every request sends `x-client-platform` (`mobile` on native, `web` when rendering with React Native Web) so the backend returns refresh tokens in the appropriate channel, and `x-device-info` containing only OS/version. Notes remain local for now.

### Steps

1. Update config: set `API_BASE_URL` to your custom domain in `MyApp/constants.ts`; colocate helpers that derive `x-client-platform` from `Platform.OS` (mobile vs web) and `x-device-info` from OS/version strings.
2. Session management: create `MyApp/auth/session.ts` using MMKV to store `{ user, accessToken, refreshToken }` plus an in-memory accessor for the current access token so both native and web builds can share the same session helpers.
3. Axios client: add `MyApp/api/client.ts` with `baseURL`, always-on platform/device headers, `Authorization` injection, and a single-flight 401 handler that calls `/api/auth/refresh`, rotates tokens, and retries the original request on both native and web targets. Include a guard to skip refresh retry loops when already attempted.
4. Auth API + hooks: implement `MyApp/api/auth.ts` for register/login/refresh/logout/logoutAll; add `MyApp/hooks/useAuth.ts` exposing TanStack mutations/queries for those flows and a boot method that refreshes on app start. Ensure these hooks work for native and web by reading session state from the shared storage helpers.
5. App wiring: wrap navigation in `QueryClientProvider` inside `MyApp/App.tsx`, add login/register screens, and gate note screens behind the session state while keeping MMKV-backed notes untouched. For future React Native Web, ensure providers/components render without native-only dependencies.

### Further Considerations

1. Device info header: simple string like `os=${Platform.OS};version=${Platform.Version ?? 'unknown'}` to satisfy backend expectations without extra libraries; distinguish web vs native via `Platform.OS`.
2. Base URL sourcing: confirm environment strategy (e.g. `.env`, remote config) for the custom domain; expose one getter consumed by both native and web entry points.
3. Future notes sync: when collaborative endpoints/CRDT arrive, plan to swap `notes-store.ts` read/write functions for protected HTTP calls while preserving offline cache. TanStack Query can bridge native/web and server state when those endpoints exist.
