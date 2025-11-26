import React from 'react';
import { StyleSheet, TextInput, View, Text, TouchableOpacity, useColorScheme, KeyboardAvoidingView, Platform } from 'react-native';
import { EditorContent, useEditor } from 'rn-text-editor';
import { getTheme } from '../theme';

export default function EditorScreen() {
  const inputRef = React.useRef<TextInput>(null) as React.RefObject<TextInput>;
  const editor: any = useEditor({
    enableCoreExtensions: true,
    onUpdate({ editor: ed }: any) {
      try {
        console.log('editor content:', ed.contentAsJson());
      } catch {
        console.log('editor update');
      }
    },
  });

  const scheme = useColorScheme();
  const theme = getTheme(scheme);

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={68}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.toolbar}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => {
              try {
                editor.commandManager.createChain(undefined, true).toggleMark('bold').run();
              } catch {
                // ignore if editor not ready
              }
            }}
          >
            <Text style={styles.toolbarButtonB}>B</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => {
              try {
                editor.commandManager.createChain(undefined, true).toggleMark('italic').run();
              } catch { }
            }}
          >
            <Text style={styles.toolbarButtonI}>I</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.editorContainer}>
          <EditorContent
            editor={editor}
            placeholder="Write something..."
            inputRef={inputRef}
            autoFocus
            scrollEnabled
            style={styles.editor}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  container: { flex: 1 },
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 6,
    gap: 12,
  },
  toolbarButtonB: {
    fontWeight: '700',
    fontSize: 16,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  toolbarButtonI: {
    fontStyle: 'italic',
    fontSize: 16,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  editorContainer: {
    flex: 1,
    padding: 12,
  },
  editor: {
    flex: 1,
    fontSize: 16,
    minHeight: 200,
    textAlignVertical: "top"
  },
});
