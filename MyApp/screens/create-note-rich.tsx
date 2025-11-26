import React, { useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import QuillEditor, { QuillToolbar } from "react-native-cn-quill";
import { useNavigation } from "@react-navigation/native";
import { getTheme } from "../theme";
import { createNote } from "../notes-store";
import { NoteListNavigationProp } from "../App";

export default function CreateNoteRich() {
  const navigation = useNavigation<NoteListNavigationProp>();
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const styles = useMemo(() => themedStyles(theme), [theme]);

  const editorRef = useRef<any>(null);
  const Editor: any = QuillEditor;

  const [title, setTitle] = useState("");
  // tags omitted in minimalist editor
  // keep a placeholder state in case we add tags later
  const [, _setTagsText] = useState("");

  const onSave = async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Title is required");
      return;
    }

    try {
      let html = "";
      try {
        if (editorRef.current && typeof editorRef.current.getHtml === "function") {
          const res = editorRef.current.getHtml();
          html = res instanceof Promise ? await res : res || "";
        }
      } catch (e) {
        console.warn("Failed to read editor HTML", e);
      }

      const plain = html ? html.replace(/<[^>]+>/g, "").trim() : "";

      createNote({
        title: title.trim(),
        description: plain || "",
        tags: [],
        descriptionHtml: html || undefined,
      } as any);

      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save note");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
        <View style={styles.inner}>
          {/* Minimal title field with underline */}
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor={theme.colors.subtext}
            style={styles.titleInput}
            autoFocus
            underlineColorAndroid="transparent"
          />

          {/* Large editor area */}
          <View style={styles.editorWrap}>
            <Editor
              ref={editorRef}
              style={styles.editor}
              initialHtml={"<p></p>"}
              webview={{ dataDetectorTypes: Platform.OS === 'ios' ? 'none' : ['none'] }}
            />
          </View>

          {/* Toolbar fixed above keyboard */}
          <QuillToolbar editor={editorRef} options="full" theme={scheme === "dark" ? "dark" : "light"} />

          {/* Footer actions */}
          <View style={styles.footerRowCompact}>
            <Pressable onPress={() => navigation.goBack()} style={styles.cancelButtonCompact} accessibilityRole="button">
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={onSave} style={[styles.saveButtonCompact, !title.trim() && styles.saveButtonDisabled]} accessibilityRole="button">
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const themedStyles = (theme: ReturnType<typeof getTheme>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: 16 },
    inner: { flex: 1 },
    label: { marginBottom: 8, fontSize: 14, color: theme.colors.text, fontWeight: '700' },
    helper: { marginTop: 6, marginBottom: 12, fontSize: 12, color: theme.colors.subtext },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 10,
      marginBottom: 12,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      fontSize: 16,
    },
    editorContainer: {
      height: 360,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 12,
      backgroundColor: theme.colors.surface,
    },
    editor: { flex: 1, backgroundColor: theme.colors.surface, padding: 12 },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    /* Minimal title underline */
    titleInput: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      marginBottom: 12,
      backgroundColor: 'transparent',
    },
    editorWrap: { flex: 1, minHeight: 300, borderRadius: 12, overflow: 'hidden', backgroundColor: theme.colors.surface, marginBottom: 8 },
    footerRowCompact: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 },
    cancelButtonCompact: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: theme.colors.elevated, marginRight: 8 },
    saveButtonCompact: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, backgroundColor: theme.colors.primary },
    cancelButton: {
      flex: 1,
      marginRight: 8,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: theme.colors.elevated,
    },
    cancelText: { color: theme.colors.subtext, fontWeight: '700' },
    saveButton: {
      flex: 1,
      marginLeft: 8,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      shadowColor: theme.shadow.shadowColor,
      shadowOpacity: theme.shadow.shadowOpacity,
      shadowRadius: theme.shadow.shadowRadius,
      shadowOffset: theme.shadow.shadowOffset,
      elevation: theme.shadow.elevation,
    },
    saveButtonDisabled: { opacity: 0.6 },
    saveText: { color: '#fff', fontWeight: '700' },
  });

