// screens/create-note.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNoteApi, updateNoteTitle, deleteNote } from "../api/notes";
import { NoteListNavigationProp } from "../App";
import { getTheme } from "../theme";


export default function CreateNote() {
  const navigation = useNavigation<NoteListNavigationProp>();
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const styles = useMemo(() => themedStyles(theme), [theme]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteId, setNoteId] = useState<string | null>(null);
  const [hasCreated, setHasCreated] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canSave = title.trim().length > 0;

  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (body: { title: string }) => createNoteApi(body),
    onSuccess: (note) => {
      setNoteId(note.id);
      setHasCreated(true);
      queryClient.setQueryData(["note", note.id], note);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to create note");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => updateNoteTitle(id, { title }),
    onSuccess: (note) => {
      queryClient.setQueryData(["note", note.id], note);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (err: any) => {
      const status = err?.status;
      const msg = err?.message || "Failed to update";
      Alert.alert("Error", `${msg}${status ? ` (code ${status})` : ""}`);
    },
  });

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

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    const trimmed = title.trim();
    if (!trimmed) return;

    if (!hasCreated && !noteId && !createMutation.isPending) {
      createMutation.mutate({ title: trimmed });
      return;
    }

    if (noteId) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateMutation.mutate({ id: noteId, title: trimmed });
      }, 400);
    }
  }, [title, hasCreated, noteId, createMutation, updateMutation]);

  const onSave = () => {
    navigation.goBack();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!noteId) return;
      const isEmptyTitle = !title.trim();
      if (!isEmptyTitle) return;
      e.preventDefault();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      deleteMutation.mutate(noteId, {
        onSettled: () => {
          queryClient.removeQueries({ queryKey: ["note", noteId] });
          queryClient.invalidateQueries({ queryKey: ["notes"] });
          navigation.dispatch(e.data.action);
        },
      });
    });
    return unsubscribe;
  }, [navigation, noteId, title, deleteMutation, queryClient]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter title"
          placeholderTextColor={theme.colors.subtext}
          style={styles.input}
          autoFocus
        />

        <Text style={styles.label}>Content</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Enter content"
          placeholderTextColor={theme.colors.subtext}
          style={[styles.input, styles.textArea]}
          multiline
        />

        <Pressable
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={onSave}
          disabled={!canSave}
          accessibilityRole="button"
          accessibilityLabel="Save note"
        >
          <Text style={styles.saveText}>Done</Text>
        </Pressable>
        
      </View>
    </KeyboardAvoidingView>
  );
}

const themedStyles = (theme: ReturnType<typeof getTheme>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    inner: { flex: 1, padding: 16 },
    label: { marginBottom: 6, fontSize: 14, color: theme.colors.text },
    helper: { marginTop: -6, marginBottom: 12, fontSize: 12, color: theme.colors.subtext },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 10,
      marginBottom: 12,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
    },
    textArea: { height: 140, textAlignVertical: "top" },
    saveButton: {
      marginTop: 8,
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: "center",
      shadowColor: theme.shadow.shadowColor,
      shadowOpacity: theme.shadow.shadowOpacity,
      shadowRadius: theme.shadow.shadowRadius,
      shadowOffset: theme.shadow.shadowOffset,
      elevation: theme.shadow.elevation,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveText: { color: "#fff", fontWeight: "700" },
    
  });
