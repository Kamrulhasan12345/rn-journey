// screens/create-note.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { Link } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createNoteApi } from "../api/notes";
import { getTheme } from "../theme";


export default function CreateNote() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const styles = useMemo(() => themedStyles(theme), [theme]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const canSave = title.trim().length > 0;
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (body: { title: string }) => createNoteApi(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to save note");
    },
  });

  const onSave = () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Title is required");
      return;
    }

    createMutation.mutate({ title: title.trim() });
  };

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

        {canSave ? (
          <Link
            screen="Notes"
            params={{}}
            onPress={onSave}
            accessibilityRole="button"
            accessibilityLabel="Save note"
            style={styles.saveButton}
          >
            <Text style={{...styles.saveText, textAlign: "center"}}>{createMutation.isPending ? "Saving..." : "Save"}</Text>
          </Link>
        ) : (
          <View style={[styles.saveButton, styles.saveButtonDisabled]}>
            <Text style={styles.saveText}>Save</Text>
          </View>
        )}
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
