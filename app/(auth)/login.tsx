import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

interface LoginProps {
  onLogin?: (email: string, password: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const colors = useThemeColors();

  function handleLogin() {
    onLogin?.(email, password);
    console.log("Login:", email, password);
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 justify-center p-5"
      style={{ backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        className="rounded-xl p-6 shadow-sm"
        style={{ backgroundColor: colors.card }}
      >
        <Text
          className="text-[28px] font-bold mb-6 text-center"
          style={{ color: colors.textPrimary }}
        >
          Login
        </Text>

        <Text
          className="text-sm font-semibold mt-3 mb-1.5"
          style={{ color: colors.textSecondary }}
        >
          Email
        </Text>
        <TextInput
          className="border rounded-lg p-3 text-base"
          style={{
            borderColor: colors.borderSecondary,
            color: colors.textPrimary,
          }}
          placeholder="you@example.com"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text
          className="text-sm font-semibold mt-3 mb-1.5"
          style={{ color: colors.textSecondary }}
        >
          Password
        </Text>
        <TextInput
          className="border rounded-lg p-3 text-base"
          style={{
            borderColor: colors.borderSecondary,
            color: colors.textPrimary,
          }}
          placeholder="••••••••"
          placeholderTextColor={colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          className="rounded-lg py-3.5 items-center mt-6"
          style={{ backgroundColor: colors.accent }}
          onPress={handleLogin}
        >
          <Text
            className="text-base font-semibold"
            style={{ color: colors.background }}
          >
            Login
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
