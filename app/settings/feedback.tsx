import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useTheme } from "@/context/ThemeContext";
import { CheckCircle, AlertCircle } from "lucide-react-native";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xykadqrz";

type Rating = 1 | 2 | 3 | 4 | 5;

const EMOJI_RATINGS: { value: Rating; emoji: string; label: string }[] = [
  { value: 1, emoji: "😞", label: "Poor" },
  { value: 2, emoji: "😕", label: "Fair" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "🤩", label: "Amazing" },
];

type Status = "idle" | "loading" | "success" | "error";

export default function Feedback() {
  const colors = useThemeColors();
  const { theme } = useTheme();

  const [rating, setRating] = useState<Rating | null>(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async () => {
    if (!rating || !message.trim()) return;

    setStatus("loading");

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: `${EMOJI_RATINGS[rating - 1].emoji} ${EMOJI_RATINGS[rating - 1].label} (${rating}/5)`,
          message,
          email: email.trim() || "Not provided",
        }),
      });

      if (res.ok) {
        setStatus("success");
        setRating(null);
        setMessage("");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const canSubmit = rating !== null && message.trim().length > 0;

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 30,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          className="text-3xl font-bold pt-14 mb-1"
          style={{ color: colors.textPrimary }}
        >
          Share Feedback
        </Text>
        <Text className="text-sm mb-10" style={{ color: colors.textSecondary }}>
          Help us improve. Your thoughts matter.
        </Text>

        {status === "success" ? (
          <View
            className="rounded-2xl p-8 items-center"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.borderSecondary,
            }}
          >
            <CheckCircle size={52} color={colors.accent} strokeWidth={1.5} />
            <Text
              className="text-xl font-bold mt-5 mb-2"
              style={{ color: colors.textPrimary }}
            >
              Thanks for the feedback!
            </Text>
            <Text
              className="text-sm text-center"
              style={{ color: colors.textSecondary }}
            >
              We read every response and use it to make things better.
            </Text>
            <TouchableOpacity
              className="mt-8 rounded-xl py-3.5 px-10"
              style={{ backgroundColor: colors.accent }}
              onPress={() => setStatus("idle")}
            >
              <Text
                className="font-semibold"
                style={{ color: colors.cardSecondary }}
              >
                Send More
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text
              className="text-sm font-semibold mb-4 uppercase tracking-widest"
              style={{ color: colors.textSecondary }}
            >
              How's your experience?
            </Text>

            <View className="flex-row justify-between mb-8">
              {EMOJI_RATINGS.map(({ value, emoji, label }) => {
                const isSelected = rating === value;
                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() => setRating(value)}
                    className="items-center flex-1 py-3 rounded-xl mx-1"
                    style={{
                      backgroundColor: isSelected ? colors.accent : colors.card,
                      borderWidth: 1,
                      borderColor: isSelected
                        ? colors.borderPrimary
                        : colors.borderSecondary,
                    }}
                  >
                    <Text className="text-2xl">{emoji}</Text>
                    <Text
                      className="text-[10px] font-semibold mt-1"
                      style={{
                        color: isSelected
                          ? colors.cardSecondary
                          : colors.textSecondary,
                      }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text
              className="text-sm font-semibold mb-2 uppercase tracking-widest"
              style={{ color: colors.textSecondary }}
            >
              Your feedback
            </Text>
            <TextInput
              className="rounded-xl px-4 py-4 text-base mb-6"
              style={{
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.borderSecondary,
                color: colors.textPrimary,
                minHeight: 120,
                textAlignVertical: "top",
              }}
              placeholder="Tell us what you think, what's broken, or what you'd love to see..."
              placeholderTextColor={colors.textSecondary}
              value={message}
              onChangeText={setMessage}
              multiline
            />

            <Text
              className="text-sm font-semibold mb-2 uppercase tracking-widest"
              style={{ color: colors.textSecondary }}
            >
              Email
            </Text>
            <TextInput
              className="rounded-xl px-4 py-4 text-base mb-8"
              style={{
                backgroundColor: colors.card,
                borderWidth: 1,
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

            {status === "error" && (
              <View
                className="flex-row items-center gap-2 rounded-xl px-4 py-3 mb-5"
                style={{
                  backgroundColor: colors.textTertiary + "1A",
                  borderWidth: 1,
                  borderColor: colors.textTertiary + "4D",
                }}
              >
                <AlertCircle size={16} color={colors.textTertiary} />
                <Text
                  className="text-sm"
                  style={{ color: colors.textTertiary }}
                >
                  Something went wrong. Please try again.
                </Text>
              </View>
            )}

            <TouchableOpacity
              className="rounded-xl py-4 items-center"
              style={{
                backgroundColor: canSubmit ? colors.accent : colors.card,
                borderWidth: 1,
                borderColor: canSubmit
                  ? colors.borderPrimary
                  : colors.borderSecondary,
              }}
              onPress={handleSubmit}
              disabled={!canSubmit || status === "loading"}
              activeOpacity={0.8}
            >
              {status === "loading" ? (
                <ActivityIndicator color={colors.cardSecondary} />
              ) : (
                <Text
                  className="text-base font-bold"
                  style={{
                    color: canSubmit
                      ? colors.cardSecondary
                      : colors.textSecondary,
                  }}
                >
                  Send Feedback
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
