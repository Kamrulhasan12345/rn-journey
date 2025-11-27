import { RouteProp } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, View, useColorScheme, ActivityIndicator, Pressable } from "react-native";
import { useNote } from "../hooks/useNotes";
import { getTheme } from "../theme";

type RootStackParamList = {
  NotesList: undefined;
  NoteDetail: { id: string };
};

type NoteDetailRouteProp = RouteProp<RootStackParamList, "NoteDetail">;

export default function NoteDetails({ route }: { route: NoteDetailRouteProp }) {
  const { id } = route.params;
  const scheme = useColorScheme();
  const theme = getTheme(scheme);

  const { data: note, isLoading, isError, refetch } = useNote(id);
  if (isLoading) {
    return (
      <View style={[baseStyles(theme).container, baseStyles(theme).center]}>
        <ActivityIndicator />
      </View>
    );
  }
  if (isError || !note) {
    return (
      <View style={[baseStyles(theme).container, baseStyles(theme).center]}>
        <Text style={baseStyles(theme).title}>Note not found</Text>
        <Text style={baseStyles(theme).sub}>It may have been deleted.</Text>
        <Pressable onPress={() => refetch()} accessibilityRole="button" accessibilityLabel="Retry">
          <Text style={{ color: theme.colors.primary }}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const created = note.createdAt ? new Date(note.createdAt).toLocaleString() : "";
  const updated = note.updatedAt ? new Date(note.updatedAt).toLocaleString() : undefined;

  return (
    <ScrollView style={baseStyles(theme).container} contentContainerStyle={baseStyles(theme).content}>
      <Text style={baseStyles(theme).title}>{note.title}</Text>
      <View style={baseStyles(theme).metaRow}>
        <Text style={baseStyles(theme).meta}>Created: {created}</Text>
        {updated && <Text style={baseStyles(theme).meta}>Updated: {updated}</Text>}
      </View>
      {!!note.content && (
        <Text style={baseStyles(theme).body}>{note.content}</Text>
      )}
    </ScrollView>
  );
}

const baseStyles = (theme: ReturnType<typeof getTheme>) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 8, color: theme.colors.text },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  meta: { color: theme.colors.subtext, fontSize: 12 },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  tag: {
    backgroundColor: theme.colors.chipBg,
    color: theme.colors.subtext,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
    fontSize: 12,
  },
  body: { color: theme.colors.text, lineHeight: 22, fontSize: 16 },
  sub: { color: theme.colors.subtext },
  center: { alignItems: 'center', justifyContent: 'center' },
});