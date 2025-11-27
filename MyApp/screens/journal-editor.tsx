import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  Button,
  Text,
} from 'react-native';
import { RichText, Toolbar, useEditorBridge } from '@10play/tentap-editor';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getTheme } from '../theme';
import { useColorScheme } from 'react-native';
import { createNote } from '../notes-store';

type RootStackParamList = {
  JournalEditor: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'JournalEditor'>;

export default function JournalEditor({ navigation }: Props) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const [title, setTitle] = useState('');

  const editor = useEditorBridge({
    autofocus: true,
    avoidIosKeyboard: true,
    initialContent: '<p></p>',
  });

  const onSave = useCallback(async () => {
    try {
      const html = (editor as any)?.getHTML ? await (editor as any).getHTML() : '';
      const note = createNote({
        title: title || 'Untitled',
        description: html || '',
      });
      navigation.navigate('NoteDetail' as any, { id: note.id });
    } catch (err) {
      console.warn('Save failed', err);
    }
  }, [editor, title, navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Journal',
      headerRight: () => <Button title="Save" onPress={onSave} />,
      headerLeft: () => (
        <Button title="Close" onPress={() => navigation.goBack()} />
      ),
    });
  }, [navigation, onSave]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor={theme.colors.subtext}
          style={[styles.titleInput, { color: theme.colors.text }]}
        />
      </View>

      <View style={styles.editorWrap}>
        <RichText editor={editor} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.toolbarWrap}
      >
        <Toolbar editor={editor} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '700',
    padding: 8,
    borderRadius: 8,
  },
  editorWrap: { flex: 1, paddingHorizontal: 16 },
  toolbarWrap: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },
});
