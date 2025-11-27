import { useNavigation } from "@react-navigation/native"
import { ColorSchemeName, Pressable, StyleSheet, Text, useColorScheme, View, Alert } from "react-native"
import { useMemo, useState, useEffect } from "react";
import { NoteDetailNavigationProp } from "../App"
import { Note } from "../api/notes";
import { getTheme } from "../theme";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNote } from "../api/notes";
import { toggleOpenCard, subscribe, setOpenCardId } from "./card-menu-state";

export default function Card({ item, scheme: schemeProp }: { item: Note; scheme?: ColorSchemeName }) {
  const navigation = useNavigation<NoteDetailNavigationProp>();
  const systemScheme = useColorScheme();
  const scheme = schemeProp ?? systemScheme;
  const theme = getTheme(scheme);

  const styles = useMemo(() => StyleSheet.create({
    wrap: { position: 'relative' },
    card: {
      marginHorizontal: 6,
      padding: 14,
      marginVertical: 8,
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      shadowColor: theme.shadow.shadowColor,
      shadowOpacity: theme.shadow.shadowOpacity,
      shadowRadius: theme.shadow.shadowRadius,
      shadowOffset: theme.shadow.shadowOffset,
      elevation: theme.shadow.elevation,
    },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: {
      fontWeight: "700",
      fontSize: 16,
      marginBottom: 6,
      color: theme.colors.text,
    },
    description: {
      color: theme.colors.subtext,
      marginBottom: 10,
      lineHeight: 20,
    },
    tagContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    tag: {
      backgroundColor: theme.colors.chipBg,
      color: theme.colors.subtext,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      marginRight: 6,
      marginBottom: 6,
      fontSize: 12,
    },
    menuTrigger: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    menu: { position: 'absolute', right: 10, top: 10, backgroundColor: theme.colors.elevated, borderRadius: 10, paddingVertical: 6, minWidth: 160, shadowColor: theme.shadow.shadowColor, shadowOpacity: theme.shadow.shadowOpacity, shadowRadius: theme.shadow.shadowRadius, shadowOffset: theme.shadow.shadowOffset, elevation: theme.shadow.elevation, zIndex: 9999 },
    menuItem: { paddingHorizontal: 12, paddingVertical: 10 },
    menuItemText: { color: theme.colors.text },
    menuItemDisabled: { opacity: 0.5 },
    destructiveText: { color: '#d32f2f' },
  }), [theme]);

  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const unsub = subscribe((openId) => {
      setMenuOpen(openId === item.id);
    });
    return unsub;
  }, [item.id]);
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteNote(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const prev = queryClient.getQueryData<any[]>(["notes"]) || [];
      queryClient.setQueryData<any[]>(["notes"], prev.filter((n) => n.id !== id));
      return { prev };
    },
    onError: (err: any, _id, ctx: any) => {
      if (ctx?.prev) queryClient.setQueryData(["notes"], ctx.prev);
      Alert.alert("Delete failed", err?.message || "Could not delete note");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return (
    <View style={styles.wrap}>
      <Pressable
        style={styles.card}
        android_ripple={{ color: theme.colors.border }}
        accessibilityRole="button"
        accessibilityLabel={`Open note ${item.title}`}
        onPress={() => navigation.navigate("NoteDetail", { id: item.id })}
      >
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{item.title}</Text>
          <Pressable onPress={() => toggleOpenCard(item.id)} accessibilityRole="button" accessibilityLabel="Open menu" style={styles.menuTrigger}>
            <Text style={{ color: theme.colors.subtext }}>⋮</Text>
          </Pressable>
        </View>
        {!!item.contentPreview && (
          <Text style={styles.description} numberOfLines={3} ellipsizeMode="tail">{item.contentPreview}</Text>
        )}
      </Pressable>
      {menuOpen && (
        <View style={styles.menu}>
          <Pressable style={styles.menuItem} onPress={() => { setOpenCardId(null); navigation.navigate("NoteDetail", { id: item.id }); }}>
            <Text style={styles.menuItemText}>Open</Text>
          </Pressable>
          <Pressable style={[styles.menuItem, styles.menuItemDisabled]} disabled>
            <Text style={styles.menuItemText}>Rename (soon)</Text>
          </Pressable>
          <Pressable style={[styles.menuItem, styles.menuItemDisabled]} disabled>
            <Text style={styles.menuItemText}>Manage Access (soon)</Text>
          </Pressable>
          <Pressable style={[styles.menuItem, styles.menuItemDisabled]} disabled>
            <Text style={styles.menuItemText}>Duplicate (soon)</Text>
          </Pressable>
          <Pressable style={[styles.menuItem, styles.menuItemDisabled]} disabled>
            <Text style={styles.menuItemText}>Transfer Ownership (soon)</Text>
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => { setOpenCardId(null); deleteMutation.mutate(item.id); }}>
            <Text style={[styles.menuItemText, styles.destructiveText]}>Delete</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}