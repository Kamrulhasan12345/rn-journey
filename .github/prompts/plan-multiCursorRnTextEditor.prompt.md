Goal: Multicursor + text sync using rn-text-editor, with a practical MVP now and an upgrade path via plugin/decorations support.

Steps (MVP feasible now)

- Selection broadcast: Read `editor.state.selection.{from,to}` on local changes; send `{anchor, head}` with socket.io awareness; receive and track per-user selections.
- Text sync: On `onUpdate`, compute diffs (content JSON or `getNativeText()`); send ops; apply remote ops via `editor.commandManager.createChain().insertContentAt(...)` and `deleteRange(...)` (avoid full replace to preserve history/selection).
- Basic remote cursor UI: Render remote users’ cursors as overlay indicators (name + color) near bottom/top of the visible editor; update positions on local scroll/selection. Note: approximate placement (no char-precise mapping).
- Loop prevention: Add `clientId` to messages; ignore echoes; debounce updates; reconcile late joins with a full doc snapshot.

Upgrade (true multicursor requires rn-text-editor engine changes)

- Wire plugins: Aggregate `addProseMirrorPlugins` from extensions and pass to `EditorState.create({ plugins })`.
- Emit selection events: Ensure `EditorContent.onSelectionChange` and transactions call `editor.emit('selectionUpdate', ...)`.
- Decorations support: Add decoration rendering in RN (map PM positions to rendered nodes; apply cursor/selection decorations per user).
- Position mapping: Expose utilities to convert PM positions → screen coordinates for precise overlay placement.
- Yjs integration: Add y-prosemirror-like plugins (`ySync`, `yCursor`) once plugins/decorations exist; wire awareness (name/color).

Constraints & Risks

- Current rn-text-editor has no `EditorView` or decoration pipeline; plugin outputs aren’t wired into `EditorState` yet.
- Command-only diffs can diverge under concurrency; robust CRDT merging needs Yjs + PM plugins.
- Approximate cursor overlays are acceptable for awareness, not for pixel-perfect caret.

Implementation Notes

- Use `onUpdate` and compare prior `editor.state.selection` to detect selection changes (no built-in `selectionUpdate` emission).
- Prefer small transactional ops (`insertContentAt`, `deleteRange`) over wholesale content setting.
- Maintain per-user awareness map `{ userId, name, color, anchor, head, timestamp }`.
- Add KeyboardAvoidingView + `scrollEnabled` for better typing UX (already implemented).

Decision Points

- If production-grade multicursor is required soon → use a WebView editor (Tiptap + Yjs + CollaborationCursor) and keep rn-text-editor as a simple mode.
- If staying with rn-text-editor → proceed with MVP now, then schedule engine upgrades (plugins + decorations) to unlock true multicursor rendering.
