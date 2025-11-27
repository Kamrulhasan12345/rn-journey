import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, useColorScheme } from "react-native";
import { Link } from "@react-navigation/native";
import { useAuth } from "../hooks/useAuth";
import { getAccessTokenFromMemory, getSession } from "../auth/session";
import { storage } from "../storage";
import { getTheme } from "../theme";

export default function LoginScreen() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginMutation } = useAuth();

  const onSubmit = () => {
    if (loginMutation.isPending) return;
    loginMutation.mutate(
      { email, password },
      {
        onError: (err: any) => {
          Alert.alert("Login failed", err?.message ?? "Unknown error");
        },
      },
    );
  };

  const memToken = getAccessTokenFromMemory();
  const sess = getSession();
  const rawStoredAccess = storage.getString('auth:accessToken');
  const rawStoredUser = storage.getString('auth:user');

  return (
    <View style={styles(theme).container}>
      <Text style={styles(theme).title}>Login</Text>
      <TextInput
        style={styles(theme).input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles(theme).input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable
        style={[styles(theme).button, loginMutation.isPending && styles(theme).buttonDisabled]}
        onPress={onSubmit}
        disabled={loginMutation.isPending}
      >
        <Text style={styles(theme).buttonText}>
          {loginMutation.isPending ? "Logging in..." : "Login"}
        </Text>
      </Pressable>
      <Pressable style={styles(theme).link}>
        <Link screen='Register' params={{}}>
          <Text>Don't have an account? Register</Text>
        </Link>
      </Pressable>
      <View style={styles(theme).debugBox}>
        <Text style={styles(theme).debugTitle}>Debug</Text>
        <Text style={styles(theme).debugLine}>memToken: {memToken ? 'set' : 'unset'}</Text>
        <Text style={styles(theme).debugLine}>session.access len: {sess.accessToken ? sess.accessToken.length : 0}</Text>
        <Text style={styles(theme).debugLine}>user: {sess.user ? sess.user.email : 'none'}</Text>
        <Text style={styles(theme).debugLine}>loginPending: {String(loginMutation.isPending)}</Text>
        <Text style={styles(theme).debugLine}>storedAccess len: {rawStoredAccess ? rawStoredAccess.length : 0}</Text>
        <Text style={styles(theme).debugLine}>storedUser raw: {rawStoredUser ? rawStoredUser.substring(0, 60) + (rawStoredUser.length>60?'…':'') : 'none'}</Text>
      </View>
    </View>
  );
}

const styles = (theme: ReturnType<typeof getTheme>) =>
  StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
    title: { fontSize: 24, fontWeight: "700", marginBottom: 16, color: theme.colors.text },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 12,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
    },
    button: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: { color: "#fff", fontWeight: "700" },
    link: { marginTop: 16, color: theme.colors.primary },
    debugBox: { marginTop: 20, padding: 12, backgroundColor: theme.colors.elevated, borderRadius: 8 },
    debugTitle: { fontWeight: '700', fontSize: 12, color: theme.colors.text, marginBottom: 6 },
    debugLine: { fontSize: 11, color: theme.colors.subtext },
  });
