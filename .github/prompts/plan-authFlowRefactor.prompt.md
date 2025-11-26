## Plan: End-to-End Auth Cleanup, UX, and Error Handling

High-level: tighten storage (ready for `react-native-keychain` later), simplify the client, use backend `{ message }` everywhere, make boot/login UX clear, and polish login/register buttons.

### Steps

1. **Introduce platform-aware token storage (`react-native-keychain`–ready)**

   - Add `auth/token-storage.ts` that:
     - Uses current `storage` (MMKV) for `user` and maybe `accessToken`.
     - Isolates `refreshToken` logic behind functions so you can later swap MMKV → `react-native-keychain` on native and `sessionStorage`/memory on web without touching other files.
   - Export:
     - `readSessionFromStorage(): SessionState`
     - `writeSessionToStorage(session: SessionState): void | Promise<void>`
     - `clearSessionStorage(): void | Promise<void>`

2. **Refactor `session.ts` into clean, side‑effect‑aware helpers**

   - Replace direct MMKV usage with `token-storage` calls.
   - Split APIs:
     - `readSessionFromStorage()` – pure read of `{ user, accessToken, refreshToken }`, no memory mutation.
     - `hydrateAccessTokenFromStorage()` – reads once and sets `inMemoryAccessToken` on app boot.
     - `getSession()` – either proxy to `readSessionFromStorage()` or return a cached `SessionState` (no hidden side effects).
     - `setSession(state)` – write via `token-storage`, update `inMemoryAccessToken`.
     - `clearSession()` – clear via `token-storage`, set `inMemoryAccessToken = null`.
     - Keep `getAccessTokenFromMemory` / `setAccessTokenInMemory` as simple accessors.

3. **Simplify and de‑spaghetti `api/client.ts`**

   - Request interceptor:
     - Remove any storage reads; rely only on `getAccessTokenFromMemory()` to set `Authorization` header.
     - Keep static headers (`x-client-platform`, `x-device-info`).
   - Response interceptor:
     - For all non‑2xx responses:
       - Extract `error.response?.data?.message` from `{ error, message }`.
       - Throw an `Error(message)` (or a custom error type) so UI always gets a meaningful `error.message`.
     - For 401s:
       - Use single `readSessionFromStorage()` snapshot per refresh.
       - Use `isRefreshing` + queue to avoid multiple refreshes.
       - On successful refresh: build `next` session, call `setSession(next)`, retry queued requests.
       - On failure / missing refresh token: call `clearSession()`, reject queued requests.
   - Decide on `withCredentials` (likely `false` if you don’t really use cookies).

4. **Keep `useAuth` as the single orchestrator for UI auth state**

   - Replace `getSession` in the query with `readSessionFromStorage()`:
     - `queryFn` and `initialData` both use it to sync React Query with storage.
   - Mutations:
     - `loginMutation` / `registerMutation`: on success, construct `next: SessionState`, call `setSession(next)`, update `["session"]` cache (same as now).
     - `logoutMutation`:
       - `mutationFn`: read `current` via `readSessionFromStorage()`, call `authApi.logout(current.refreshToken)`.
       - `onSettled`: `clearSession()` + reset `["session"]` to nulls.
     - `logoutAllMutation`: `authApi.logoutAll()` then `clearSession()` + reset `["session"]`.
   - Boot:
     - Keep `bootRefresh` (or rename to `bootstrapSession` internally):
       - Read `current` via `readSessionFromStorage()`.
       - If no `refreshToken`: `clearSession()` + reset query.
       - Else:
         - Call `authApi.refresh(current.refreshToken)`.
         - Build `next` with new tokens, call `setSession(next)` + update query.
       - On error: `clearSession()` + reset query.

5. **Clarify app-start behavior in `App.tsx`**

   - Maintain `isBooting` state:
     - On mount, call `bootRefresh` once.
     - Show a loading screen while `isBooting` is true.
   - After boot:
     - If `isAuthenticated` (from `useAuth`) is true → render main app stack.
     - Else → render auth stack (login/register).
   - This ensures:
     - If MMKV has a valid session → you land in the app.
     - If not or it’s invalid → you land in login.

6. **Wire backend `{ error, message }` into UI errors**

   - In `api/client.ts` response interceptor:
     - For any 4xx/5xx:
       - Prefer `error.response?.data?.message` as the thrown error’s `message`.
       - Fallback to a generic message if `message` is missing.
   - In `authApi` functions:
     - Don’t swallow or re-wrap these errors; let them bubble up so `useMutation` gets an `error` with the correct `message`.
   - In login/register screens:
     - Use `mutation.error?.message` (or the `onError` callback) to show alerts/snackbars with the backend-provided message for **all** 4xx, not just 401.

7. **Improve login & register button UX**

   - In login/register screens:
     - Use `loginMutation.isPending` / `registerMutation.isPending` to:
       - Disable the submit button while the API call is in progress.
       - Show a loading indicator/spinner in place of the button text or next to it.
     - Example behavior:
       - Idle: button shows “Login” / “Register”, enabled.
       - Pending: button shows “Logging in…” / “Registering…”, disabled, spinner shown.
   - Optionally:
     - Use `onSuccess` in screen or observe `mutation.isSuccess` to:
       - Navigate away from the login/register screen only after success.
       - Clear error messages when the user edits inputs again.

8. **Prepare for future `react-native-keychain` and RN Web**
   - Once the abstraction is in place:
     - Native:
       - Swap the refresh token implementation inside `token-storage` to use `react-native-keychain` (keep same exported API).
     - Web:
       - Implement web-specific behavior inside `token-storage` (e.g., store refresh token in `sessionStorage`, or in memory only).
   - No changes needed in `useAuth`, `session.ts`, or `client.ts` for these platform differences.
