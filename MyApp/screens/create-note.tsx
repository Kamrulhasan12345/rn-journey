// screens/create-note.tsx
import React, { useMemo, useState } from "react";
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

import { createNote } from "../notes-store";
import { NoteListNavigationProp } from "../App";
import { getTheme } from "../theme";


export default function CreateNote() {
  const navigation = useNavigation<NoteListNavigationProp>();
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const styles = useMemo(() => themedStyles(theme), [theme]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsText, setTagsText] = useState("");
  const canSave = title.trim().length > 0;

  function parseTags(text: string): string[] {
    return text
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  const onSave = () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Title is required");
      return;
    }

    try {
      createNote({
        title: title.trim(),
        description: description.trim(),
        tags: parseTags(tagsText),
      } as { title: string; description: string; tags?: string[] });

      // Navigate back to list. If you want to scroll to the new note,
      // you can pass the id: navigation.navigate('Notes', { createdId: note.id })
      navigation.goBack();
    } catch (e) {
      console.error("Failed to create note", e);
      Alert.alert("Error", "Failed to save note");
    }
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

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
          placeholderTextColor={theme.colors.subtext}
          style={[styles.input, styles.textArea]}
          multiline
        />

        <Text style={styles.label}>Tags (comma separated)</Text>
        <TextInput
          value={tagsText}
          onChangeText={setTagsText}
          placeholder="tag1, tag2"
          placeholderTextColor={theme.colors.subtext}
          style={styles.input}
        />
        <Text style={styles.helper}>Separate tags with commas</Text>

        <Pressable
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={onSave}
          disabled={!canSave}
          accessibilityRole="button"
          accessibilityLabel="Save note"
        >
          <Text style={styles.saveText}>Save</Text>
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
