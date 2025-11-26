## Plan: Quill + Yjs Collaboration

Implement real-time collaborative editing inside `react-native-cn-quill`’s WebView using Yjs with `y-websocket`, `awareness`, and `quill-cursors`. Bind Quill to a Yjs `Y.Text`, wire presence to multi-cursors, and bridge RN↔WebView for init, status, and actions.

### Steps

- **Bundle editor HTML:** Load `quill`, `quill-cursors`, `yjs`, `y-websocket`, and a Quill–Yjs binding (e.g., `quill-yjs`) in a custom `initialHtml` with a boot script.
- **Initialize Yjs in WebView:** Create `Y.Doc`, `WebsocketProvider(providerUrl, roomId, ydoc)`, `awareness = provider.awareness`, bind `Quill` ↔ `ydoc.getText('content')` via adapter.
- **Wire multi-cursor:** Attach `quill-cursors` and map `awareness` updates to cursors; on `selection-change`, set local `awareness` cursor `{ index, length }`.
- **RN↔WebView bridge:** RN sends `init { roomId, providerUrl, user { id, name, color } }`; WebView posts `status`, `awareness-update`, and throttled `text-update` back. RN can send `apply-action`, `disconnect/reconnect`.
- **Screen integration:** Add `CreateNoteRichCollab` (new screen) that renders `QuillEditor` with custom `initialHtml`; pass `roomId` and `user` via route params; register in `App.tsx` with `headerShown: false`.
- **Persistence:** Use Yjs server persistence; store periodic HTML snapshots for offline `note-details.tsx` fallback; render live read-only via same room when online.

### Presence & Identity

- **Identity mapping:** RN provides `{ id, name, color }` → `awareness.setLocalState({ user, cursor })`.
- **Cursor updates:** On Quill `selection-change`, update `awareness.cursor`; `quill-cursors` renders peers.
- **Disconnects:** Awareness timeouts remove stale peers; handle provider status events to reflect connection state.

### Performance & Security

- **Bundle/minify:** Inline or local-bundled scripts to avoid CDN issues; add CSP; disable external navigation.
- **Throttle messaging:** 250–500 ms for `text-update`; use `updateContents` not full `setContents`.
- **IME & mobile quirks:** Test composition events; throttle selection updates; ensure keyboard handling on Android/iOS.

### Offline & Resync

- **CRDT merges:** Yjs deterministically merges concurrent edits; adapter applies deltas.
- **Reconnect:** `y-websocket` auto-reconnects; listen to `provider.on('status', ...)`; allow manual reconnect.
- **Document size:** Segment rooms per note; avoid excessive history; batch operations.

### RN/WebView Message Schema

- **RN→WebView:**
  - `init`: `{ roomId, providerUrl, user: { id, name, color } }`
  - `presence`: `{ cursor: { index, length } }`
  - `apply-action`: `{ type, args }` (e.g., format, undo)
  - `disconnect` | `reconnect`
- **WebView→RN:**
  - `status`: `{ connected: boolean }`
  - `awareness-update`: `{ peers: Array<{ id, name, color, cursor }> }`
  - `text-update` (throttled): `{ delta | htmlSnapshot, version }`

### Integration Plan in Repo

- **Create screen:** `screens/create-note-collab.tsx` (new). Uses `react-native-cn-quill` with custom `initialHtml` and `webview` prop (`dataDetectorTypes` workaround).
- **Navigator:** Add `CreateNoteRichCollab` route with `{ noteId, roomId }`; hide header.
- **Store:** Continue to store `description` and optional `descriptionHtml` for snapshot; rely on backend for live doc.
- **Details view:** If online, render read-only Quill bound to same room; otherwise fallback to HTML snapshot.

### References

- Yjs: https://docs.yjs.dev
- y-websocket: https://github.com/yjs/y-websocket
- Awareness: https://github.com/yjs/y-protocols#awareness
- Quill API: https://quilljs.com/docs/api/
- quill-cursors: https://github.com/quilljs/quill-cursors
- Binding examples: https://github.com/yjs/yjs-demos (Quill + Yjs), community adapters like `quill-yjs`
- RN WebView messaging: https://github.com/react-native-webview/react-native-webview#communicating-between-js-and-native
- Mobile best practices: RN WebView perf tips, IME/selection throttling
