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

type RegisterNav = NativeStackNavigationProp<RootStackParamList, "Register">;

export default function RegisterScreen() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { registerMutation } = useAuth();
  const navigation = useNavigation<RegisterNav>();

  const onSubmit = () => {
    if (registerMutation.isPending) return;
    registerMutation.mutate(
      { name, email, password },
      {
        onError: (err: any) => {
          Alert.alert("Registration failed", err?.message ?? "Unknown error");
        },
      },
    );
  };

  return (
    <View style={styles(theme).container}>
      <Text style={styles(theme).title}>Register</Text>
      <TextInput
        style={styles(theme).input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
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
        style={[styles(theme).button, registerMutation.isPending && styles(theme).buttonDisabled]}
        onPress={onSubmit}
        disabled={registerMutation.isPending}
      >
        <Text style={styles(theme).buttonText}>
          {registerMutation.isPending ? "Creating account..." : "Create Account"}
        </Text>
      </Pressable>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles(theme).link}>Already have an account? Login</Text>
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
