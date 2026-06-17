import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/hooks/useThemeColors";
import { supabase } from "@/lib/supabase";

interface RegisterProps {
  onRegister?: (email: string, password: string) => void;
}

export default function Register({ onRegister }: RegisterProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const colors = useThemeColors();
  const router = useRouter();

  const handleRegister = async () => {
    setError(null);
    setSuccess(false);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
      onRegister?.(email, password);

      setTimeout(() => {
        router.replace("/profile");
      }, 1500);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    }
  };

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
          className="text-[28px] font-bold mb-1 text-center"
          style={{ color: colors.textPrimary }}
        >
          Create Account
        </Text>

        <Text
          className="text-sm text-center mb-6"
          style={{ color: colors.textSecondary }}
        >
          Your seat is waiting. Join us!!!
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

        <Text
          className="text-sm font-semibold mt-3 mb-1.5"
          style={{ color: colors.textSecondary }}
        >
          Confirm Password
        </Text>
        <TextInput
          className="border rounded-lg p-3 text-base"
          style={{
            borderColor: colors.borderSecondary,
            color: colors.textPrimary,
          }}
          placeholder="••••••••"
          placeholderTextColor={colors.textSecondary}
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
        />

        {error && (
          <Text className="text-red-500 text-sm mt-3 text-center">{error}</Text>
        )}

        {success && (
          <View className="mt-3 rounded-lg p-3" style={{ backgroundColor: "#d1fae5" }}>
            <Text className="text-green-700 text-sm text-center font-semibold">
              Registration successful! Redirecting...
            </Text>
          </View>
        )}

        <TouchableOpacity
          className="rounded-lg py-3.5 items-center mt-6"
          style={{ backgroundColor: success ? "#86efac" : colors.accent }}
          onPress={handleRegister}
          disabled={success}
        >
          <Text
            className="text-base font-semibold"
            style={{ color: colors.background }}
          >
            {success ? "✓ Done!" : "Register"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}