import React, { useLayoutEffect, useState } from 'react';
import { SafeAreaView, View, StyleSheet, TextInput, Button, useColorScheme, Text } from 'react-native';
import { getTheme } from '../theme';
import { createNote } from '../notes-store';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  JournalEditor: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'JournalEditor'>;

export default function JournalEditorWeb({ navigation }: Props) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const onSave = () => {
    const note = createNote({ title: title || 'Untitled', description: body });
    navigation.navigate('NoteDetail' as any, { id: note.id });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Journal (Web)',
      headerRight: () => <Button title="Save" onPress={onSave} />,
      headerLeft: () => <Button title="Close" onPress={() => navigation.goBack()} />,
    });
  }, [navigation, title, body]);

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
        <Text style={{ color: theme.colors.subtext, marginBottom: 8 }}>Simple web fallback editor</Text>
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Write your note..."
          placeholderTextColor={theme.colors.subtext}
          multiline
          textAlignVertical="top"
          style={[styles.bodyInput, { color: theme.colors.text, borderColor: theme.colors.elevated }]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  titleInput: { fontSize: 20, fontWeight: '700', padding: 8, borderRadius: 8 },
  editorWrap: { flex: 1, paddingHorizontal: 16 },
  bodyInput: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 12 },
});
