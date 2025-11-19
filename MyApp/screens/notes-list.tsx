import MasonryList from "@react-native-seoul/masonry-list";
import Card from "../ui/card";
import { useCallback, useEffect, useState } from "react";
import { Note, getAllNotes } from "../notes-store";
import { storage } from "../storage";
import { useColorScheme, View, Text, Pressable, StyleSheet } from "react-native";
import { getTheme } from "../theme";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation } from "@react-navigation/native";
import { NoteListNavigationProp } from "../App";

export default function NotesList() {
  const [notes, setNotes] = useState<Note[]>(() => getAllNotes());
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const navigation = useNavigation<NoteListNavigationProp>();

  useEffect(() => {
    const listener = storage.addOnValueChangedListener(() => {
      setNotes(getAllNotes());
    });
    return () => listener.remove();
  }, []);

  const renderItem = useCallback(({ item }: { item: unknown; }) => {
    const note = item as Note;
    return <Card item={note} scheme={scheme} />;
  }, [scheme]);

  return (
    <View style={styles(theme).container}>
      <MasonryList
        data={notes}
        keyExtractor={(item) => `${item.id}-${scheme || 'light'}`}
        numColumns={2}
        renderItem={renderItem}
        style={styles(theme).list}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.xl + 56,
        }}
        ListEmptyComponent={EmptyState}
      />

      <Pressable
        onPress={() => navigation.navigate("CreateNote")}
        style={styles(theme).fab}
        accessibilityRole="button"
        accessibilityLabel="Add note"
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

function EmptyState() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const navigation = useNavigation<NoteListNavigationProp>();
  return (
    <View style={styles(theme).emptyWrap}>
      <Text style={styles(theme).emptyTitle}>No notes yet</Text>
      <Text style={styles(theme).emptySub}>Create your first note to get started.</Text>
      <Pressable
        onPress={() => navigation.navigate("CreateNote")}
        style={styles(theme).cta}
        accessibilityRole="button"
        accessibilityLabel="Create note"
      >
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={styles(theme).ctaText}>Create Note</Text>
      </Pressable>
    </View>
  );
}

const styles = (theme: ReturnType<typeof getTheme>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    list: { flex: 1 },
    emptyWrap: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.xl * 2,
      gap: 8,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
    },
    emptySub: {
      color: theme.colors.subtext,
      marginBottom: theme.spacing.sm,
    },
    cta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: theme.radius.pill,
    },
    ctaText: { color: "#fff", fontWeight: "600" },
    fab: {
      position: "absolute",
      right: 20,
      bottom: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      shadowColor: theme.shadow.shadowColor,
      shadowOpacity: theme.shadow.shadowOpacity,
      shadowRadius: theme.shadow.shadowRadius,
      shadowOffset: theme.shadow.shadowOffset,
      elevation: theme.shadow.elevation,
    },
  });