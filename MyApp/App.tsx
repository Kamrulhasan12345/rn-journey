import * as React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import NotesList from './screens/notes-list';
import NoteDetails from './screens/note-details';
import CreateNote from './screens/create-note';
import { getTheme } from './theme';

type RootStackParamList = {
  Notes: undefined;
  NoteDetail: { id: string }
  CreateNote: undefined
};

type NoteDetailProps = NativeStackScreenProps<RootStackParamList, 'NoteDetail'>;
type NoteListProps = NativeStackScreenProps<RootStackParamList, 'Notes'>;

export type NoteDetailNavigationProp = NoteDetailProps['navigation']
export type NoteListNavigationProp = NoteListProps['navigation']

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const theme = getTheme(isDarkMode ? 'dark' : 'light');

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.surface },
            headerTitleStyle: { color: theme.colors.text },
            headerTintColor: theme.colors.text,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Screen name='Notes' component={NotesList} />
          <Stack.Screen name='NoteDetail' component={NoteDetails} />
          <Stack.Screen name='CreateNote' component={CreateNote} options={{
            title: 'Create Note'
          }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// no component-level styles currently