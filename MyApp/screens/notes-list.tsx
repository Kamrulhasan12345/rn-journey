import MasonryList from "@react-native-seoul/masonry-list";
import Card from "../ui/card";
import { useCallback, useEffect, useState } from "react";
import { Note, getAllNotes } from "../notes-store";
import { storage } from "../storage";
import { useColorScheme, View, Text, Pressable, StyleSheet } from "react-native";
import { getTheme } from "../theme";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Link } from "@react-navigation/native";
import { useAuth } from "../hooks/useAuth";

export default function NotesList() {
  const [notes, setNotes] = useState<Note[]>(() => getAllNotes());
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const { logoutMutation } = useAuth();

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
      <View style={styles(theme).topBar}>
        <Text style={styles(theme).topBarTitle}>My Notes</Text>
        <Pressable
          onPress={() => logoutMutation.mutate()}
          style={styles(theme).logoutButton}
          disabled={logoutMutation.isPending}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <Ionicons name="log-out-outline" size={18} color={theme.colors.primary} />
          <Text style={styles(theme).logoutText}>
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </Text>
        </Pressable>
      </View>

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
        style={styles(theme).fab}
        accessibilityRole="button"
        accessibilityLabel="Add note"
      >
        <Link screen='CreateNote' params={{}}>
          <Ionicons name="add" size={28} color="#fff" />
        </Link>
      </Pressable>

      <Pressable
        style={styles(theme).fabSecondary}
        accessibilityRole="button"
        accessibilityLabel="Open journal editor"
      >
        <Link screen='JournalEditor' params={{}}>
          <Ionicons name="create" size={22} color="#fff" />
        </Link>
      </Pressable>
    </View>
  );
}

function EmptyState() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  return (
    <View style={styles(theme).emptyWrap}>
      <Text style={styles(theme).emptyTitle}>No notes yet</Text>
      <Text style={styles(theme).emptySub}>Create your first note to get started.</Text>
      <Pressable
        style={styles(theme).cta}
        accessibilityRole="button"
        accessibilityLabel="Create note"
      >
        <Link screen='CreateNote' params={{}}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles(theme).ctaText}>Create Note</Text>
        </Link>
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
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
    },
    topBarTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.text,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.elevated,
    },
    logoutText: {
      color: theme.colors.primary,
      fontWeight: "600",
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
    fabSecondary: {
      position: 'absolute',
      right: 90,
      bottom: 30,
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      shadowColor: theme.shadow.shadowColor,
      shadowOpacity: theme.shadow.shadowOpacity,
      shadowRadius: theme.shadow.shadowRadius,
      shadowOffset: theme.shadow.shadowOffset,
      elevation: theme.shadow.elevation,
    },
  });