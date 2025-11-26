## Plan: Roadmap To Collaborative AI Notes

Turn the current local-only app into a cloud-synced, real-time collaborative notes product with Markdown and AI. Start by laying foundations (auth, cloud schema, sync), then add Markdown editing, presence and multi-cursors (CRDT), and finally AI summaries and search. Keep each phase shippable.

### Steps

1. Choose backend + auth: pick Supabase/Firebase; scaffold users, sessions, profiles; wire sign-in UI.
2. Define cloud schema: add `notes`, `note_members`, `revisions`, `attachments` with ACLs; migrate local → cloud sync.
3. Add realtime sync: integrate Supabase Realtime/Liveblocks; map notes to docs; implement presence channel.
4. Introduce Markdown: render via `react-native-markdown-display`; add editor (WebView TipTap+Yjs or native TextInput with toolbar).
5. Add collaboration (CRDT): adopt Yjs doc per note; wire provider (y-websocket/Liveblocks/Supabase); show cursors/avatars.
6. AI layer: background embeddings, semantic search, summarize/title/tag generator; store vectors (pgvector/Qdrant).

### Further Considerations

1. Backend choice: Supabase (SQL+Realtime+Storage) vs Firebase (Firestore) vs Liveblocks (managed presence/CRDT).
2. Editor approach: WebView (TipTap/ProseMirror+Yjs) vs native markdown editor; WebView is fastest to collaborate.
3. AI stack: OpenAI/Anthropic API now; vectors in pgvector; consider on-device later for privacy.

---

## Native‑First Roadmap (MongoDB + Express + WS)

Keep the app feeling native, use MongoDB with your own Express auth API and a custom WebSocket server. Defer AI/vector DB until last, leave room for multi-cursor collaboration.

### Phase 1 — Foundations (Backend + App wiring)

- Backend Auth/API:
  - Users: `_id`, `email`, `password_hash`, `createdAt`, `updatedAt`.
  - JWT: short-lived access + refresh; rotating refresh tokens; revoke table/collection.
  - Endpoints: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`.
- App Auth:
  - Stacks: `AuthStack` (login/register) + `AppStack`.
  - Token storage: `react-native-keychain` (preferred) or `react-native-encrypted-storage`.
  - API module: `api/client.ts` with base URL, auth header injection, refresh flow, exponential backoff.
- Config:
  - Env handling: `app.json` extra or minimal `env.ts` per build; avoid bundling secrets.
  - Error/analytics hooks (Sentry optional later).

### Phase 2 — Notes Schema + Cloud Sync (Offline-first)

- Mongo Schemas:
  - `notes`: `_id`, `ownerId`, `title`, `contentMarkdown`, `tags: string[]`, `createdAt`, `updatedAt`, `deletedAt?`, `lastEditorId`.
  - `note_members`: `noteId`, `userId`, `role` ('owner'|'editor'|'viewer'), indexes for (userId,noteId).
  - `revisions` (optional now): `noteId`, `userId`, `rev`, `diff|patch`, `createdAt`.
- REST Endpoints:
  - CRUD: `GET /notes`, `GET /notes/:id`, `POST /notes`, `PATCH /notes/:id`, `DELETE /notes/:id`.
  - Sync: `GET /sync?since=<ts>` returns changed (created/updated/deleted) notes; server stamps `updatedAt`.
- App Sync Engine:
  - Keep MMKV as local mirror; add a `pendingOps` queue for offline creates/edits/deletes.
  - Conflict policy v1: last-write-wins by `updatedAt` (CRDT comes later).
  - Background sync on app focus/network regain; delta fetch via `since`.

### Phase 3 — Realtime Presence + Updates (Pre-CRDT)

- WebSocket Server:
  - Auth via JWT on connect; rooms: `notes:<noteId>`, `presence:<noteId>`.
  - Events: `presence.join/leave`, `note.updated`, `typing`, `selection` (ranges for future cursors).
  - Server writes authoritative changes to Mongo; broadcasts delta payloads.
- App:
  - WS client per open note; optimistic UI + reconcile with server payloads.
  - Presence UI: avatars/badges on Note Details; basic typing indicator.

### Phase 4 — Markdown (Renderer now, Editor next)

- Renderer (native-friendly):
  - `react-native-markdown-display` for viewing in Note Details, consistent theming.
  - Code blocks: syntax highlighting via `react-native-syntax-highlighter` (optional).
- Native Editor (keep it native initially):
  - Start with `TextInput` (multiline) + keyboard accessory toolbar (bold/italic/code/heading/checkbox).
  - Live preview toggle in Note Details (Edit/Preview tabs).
  - Attachments later: use native pickers + upload to your API (store URLs in content or attachments collection).
- Save format: Markdown string; keep schema simple now; add metadata (frontmatter) later if needed.

### Phase 5 — Collaboration (CRDT + Multi‑cursor)

- Choice:
  - Yjs (mature, compact updates) or Automerge (easier API). Both run fine in React Native (JS only).
- Minimal CRDT Integration:
  - Store the CRDT doc or append-only updates in Mongo (`note_docs` or `note_updates`).
  - WS server forwards CRDT updates to room peers; persists updates; periodically compacts.
- Multi-cursor in native:
  - Track selection ranges via WS; render colored cursor badges/selection highlights in the editor.
  - Caveat: native `TextInput` gives limited position metrics; fully accurate multi-cursor is hard.
  - Two tracks:
    - A: “Good-enough” cursor markers at line-level or approximate positions (stays native).
    - B: When you’re ready, swap editor to a WebView ProseMirror/TipTap+Yjs for pixel-perfect cursors (keeps rest of app native).

### Phase 6 — AI (Last)

- Features:
  - Summaries, smart titles/tags, “continue writing”, and semantic search.
- Data:
  - Keep `embeddings` collection or vector store later; associate `noteId`, `chunk`, `embedding`, `updatedAt`.
- Flow:
  - Background indexer worker after note updates; embed Markdown chunks; server-side calls to LLM.
  - App UI: “Summarize”, “Generate title/tags”, “Ask this note” actions in details.

### Native UI Inspirations (you build them; keep it snappy)

- Notes List:
  - Bear/Apple Notes vibe: large section header (“All Notes”), segmented controls for filters (All, Starred, Tags).
  - Dense cards with subtle shadows and tag chips; pull-to-search; big FAB; swipe to delete/archive.
- Note Details:
  - Sticky title; subdued meta (created/updated, collaborators).
  - Inline tag chips under title; clean markdown typography with comfortable line-height and margins.
- Editor:
  - Keyboard accessory bar: Bold, Italic, H1/H2, Code, Checklist, Quote, Link.
  - Collapsible toolbar row above keyboard; live character/word count; “Preview” toggle.
- Collaboration:
  - Presence avatars (stacked), tiny status dots; “Currently editing” bubble.
  - Cursor colors tied to collaborators; light pulse animation on remote changes.
- Theming:
  - Keep your `theme.ts`; add semantic tokens (success/warn/info, chipFg, link, codeBg).
  - Respect platform typography sizes and insets; fluid spacing.

### What to do next (concrete, bite-sized)

- Backend
  - Stand up Express + Mongo: users + auth endpoints (JWT w/ refresh).
  - Define `notes` and `note_members` collections; CRUD endpoints.
- App
  - Add `AuthStack` and token-secure storage; API client with refresh flow.
  - Replace `createNote()` with POST to API; sync engine pulls `GET /sync?since`.
  - Add Markdown renderer to `NoteDetails`; keep current TextInput editor (toolbar stub).
- Realtime
  - Add WS server with JWT auth; join `notes:<id>`; broadcast `note.updated`.
  - Show presence count and initials on `NoteDetails`.
- Optional in this sprint
  - Tag filter chips on list; search bar; optimistic delete/restore.
