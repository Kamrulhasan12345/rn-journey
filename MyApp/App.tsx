import * as React from 'react';
import { StatusBar, useColorScheme, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import NotesList from './screens/notes-list';
import NoteDetails from './screens/note-details';
import CreateNote from './screens/create-note';
import Editor from './screens/editor';
import LoginScreen from './screens/login';
import RegisterScreen from './screens/register';
import { useAuth } from './hooks/useAuth';
import { getTheme } from './theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Notes: undefined;
  NoteDetail: { id: string }
  CreateNote: undefined
  Editor: undefined
};

type NoteDetailProps = NativeStackScreenProps<RootStackParamList, 'NoteDetail'>;
type NoteListProps = NativeStackScreenProps<RootStackParamList, 'Notes'>;

export type NoteDetailNavigationProp = NoteDetailProps['navigation']
export type NoteListNavigationProp = NoteListProps['navigation']

const Stack = createNativeStackNavigator<RootStackParamList>()

const queryClient = new QueryClient();

function RootNavigator() {
  const { isAuthenticated, bootRefresh } = useAuth();
  const [booted, setBooted] = React.useState(false);
  const isDarkMode = useColorScheme() === 'dark';
  const theme = getTheme(isDarkMode ? 'dark' : 'light');

  React.useEffect(() => {
    (async () => {
      await bootRefresh();
      setBooted(true);
    })();
  }, [bootRefresh]);

  if (!booted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { color: theme.colors.text },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name='Notes' component={NotesList} />
          <Stack.Screen name='NoteDetail' component={NoteDetails} />
          <Stack.Screen name='CreateNote' component={CreateNote} options={{
            title: 'Create Note'
          }} />
          <Stack.Screen name='Editor' component={Editor} options={{ title: 'Editor' }} />
        </>
      ) : (
        <>
          <Stack.Screen name='Login' component={LoginScreen} />
          <Stack.Screen name='Register' component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <RootNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

// no component-level styles currently