import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, useColorScheme } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../hooks/useAuth";
import { getTheme } from "../theme";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Login: undefined;
  Notes: undefined;
  Register: undefined;
};

type LoginNav = NativeStackNavigationProp<RootStackParamList, "Login">;

export default function LoginScreen() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginMutation } = useAuth();
  const navigation = useNavigation<LoginNav>();

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
      <Pressable onPress={() => navigation.navigate("Register")}>
        <Text style={styles(theme).link}>Don't have an account? Register</Text>
      </Pressable>
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
  });
