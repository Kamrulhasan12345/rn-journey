## Plan: Polish Notes UI (3 screens)

Unify visuals with a small theme (colors, spacing, radii), refreshed cards, improved typography, better tags and metadata, and clear empty/loading states. Add a floating add button for faster note creation. Keep dependencies unchanged and respect light/dark using `useColorScheme`, ensuring consistent, accessible styling across list, details, and create screens.

### Steps

1. Add theme tokens in `MyApp/theme.ts` and use `useColorScheme` in `App.tsx` for `colors`, `spacing`, `radius`, `shadow`.
2. Refresh `ui/card.tsx` (`Card`): increase padding, rounded corners, shadow, `numberOfLines`, improved tag chips, press feedback.
3. Enhance `screens/notes-list.tsx` (`NotesList`): tune masonry `gutter`/`contentContainerStyle`, add empty state, add `+` FAB to navigate to `CreateNote`.
4. Upgrade `screens/note-details.tsx` (`NoteDetails`): wrap in `ScrollView`, bigger title + subdued metadata (created/updated), inline tag chips, comfortable spacing.
5. Improve `screens/create-note.tsx` (`CreateNote`): labeled inputs, helper text, keyboard avoidance, disabled Save until valid, consistent button style.
6. Clean up types and a11y: align route/param types, remove unused imports, add `accessibilityRole`/labels to buttons and cards.

### Further Considerations

1. Theming depth: Basic light/dark now, optional app-wide provider later.
2. FAB style: Custom `Pressable` + shadow vs header-only action.
3. Dates: Use `toLocaleString` now; consider `dayjs` if formatting needs grow.
